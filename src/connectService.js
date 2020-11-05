const IdentityWallet = require('identity-wallet').default
const Url = require('url-parse')
const store = require('store')
import CeramicClient from '@ceramicnetwork/ceramic-http-client'
const sha256 = require('js-sha256').sha256
import { definitions } from '@ceramicstudio/idx-constants'
import { IDX } from '@ceramicstudio/idx'
import IframeService from './iframeService.js'
import { RPCError } from 'rpc-utils'

const CERAMIC_API = 'https://ceramic.3boxlabs.com'
const ACCOUNT_KEY = 'accounts'
const LINK_KEY = 'links'
const ACTIVE_ACCOUNT_KEY = 'active_account'

// TODO didprovider, auth failed codes?
const rpcError = (id) => {
  const rpcError = new RPCError(-32401, `3id-connect: Request not authorized`)
  return Object.assign(rpcError.toObject(), {id})
} 

/**
 *  ConnectService runs an identity wallet instance and rpc server with
 *  bindings to receive and relay rpc messages to identity wallet
 */
class ConnectService extends IframeService {

  constructor () {
    super()
  }

  /**
  *  Start connect service. Once returns ready to receive rpc requests
  *
  * @param     {Function}    userRequestHandler   Function to handle request for user (in user interface/modal)
  * @param     {Function}    errorCB              Function to handle errors, function consumes error string (err) => {...}, called on errors
  * @param     {Function}    cancel               Function to cancel request, consumes callback, which is called when request is cancelled (cb) => {...}
  */

  async start(userRequestHandler, errorCb, cancel) {
    this.cancel = cancel
    this.errorCb = errorCb
    this.userRequestHandler = userRequestHandler
    this.ceramic = new CeramicClient(CERAMIC_API)
    super.start(this.requestHandler.bind(this))
    this.activeAccount = null
  }

  // Simplified Assumptions
  // always asks for authsecret if not available locally, ie two accounts linked, first one already auth, will not look up link for second to see if same did, will ask for an authsecret again
  // when account hasnt seen, two options, link to "active account" or create new, 
  // linking means add auth method and public link right now, but can unbundle, code currently assumes in places
  // better manage state for race conditions, two window active

  // TODO handle link state better, stores links now, but does not sync with network before lookup
  async init(accountId, authReq, domain) {
    let authSecret = this.getStoredAccount(accountId)
    const accounts = this.getStoredAccountList()

    const accountAlreadyExist = Boolean(authSecret)
    const firstAccount = !Boolean(accounts)
    const otherAccountsExist = !Boolean(authSecret) && Boolean(accounts)

    let existInNetworkOnly 
    if (!accountAlreadyExist) {
      // todo dont block visual modal with this
      existInNetworkOnly  = Boolean(await this._resolveLink(accountId))
    }

    let authId = accountId
    let authSecretAdd = null
    
    if (firstAccount || existInNetworkOnly ) {
      await this.userPermissionRequest(authReq, domain)
      authSecret = await this.authCreate(accountId)
    }

    if (otherAccountsExist && !authSecret) {
      // change request type, for now will link to "active account" (true) or create new, pass single account not array
      const activeAccount = this.getActiveAccount() || accounts[0]
      const linkHuh = await this.userRequestHandler({ type: "account", accounts: [activeAccount]})
      if (linkHuh) {
        authId = activeAccount
        authSecret = this.getStoredAccount(authId)
        authSecretAdd = await this.authCreate(accountId)
      } else {
        authSecret = await this.authCreate(accountId)
      }
    }

    await this.initIdentity(authSecret, authId)

    if (otherAccountsExist && authSecretAdd) {
      await this.addAuth(accountId, authSecretAdd)
    }

    if (firstAccount || authSecretAdd || accountAlreadyExist || !existInNetworkOnly) {
      await this.tryCreateLink(accountId)
    }

    if (!firstAccount && !existInNetworkOnly) {
      await this.userPermissionRequest(authReq, domain)
    }

    this.setActiveAccount(accountId)
  }

  async initIdentity(authSecret, authId) {
     // Same request relayed before idw handles it, if request reaches idw, then permission given
     const getPermission = () => true

     this.idw = await IdentityWallet.create({ getPermission, ceramic: this.ceramic, authSecret, authId })
     this.provider = this.idw.getDidProvider()
     await this.ceramic.setDIDProvider(this.provider)
     this.idx =  new IDX({ ceramic: this.ceramic, definitions })
  }

  async tryCreateLink(accountId) {
    const links = await this.idx.get('cryptoAccountLinks')
    if (links) this.storeDIDLinks(this.idw.id, Object.keys(links))
    if (!(links && links[accountId])) await this.createLinkDoc(accountId) 
  }

  async addAuth (accountId, authSecretAdd) {
    await this.idw.keychain.add(accountId, authSecretAdd)
    await this.idw.keychain.commit()
  }

  async userPermissionRequest(authReq, domain) {
    const userReq = this._createUserRequest(authReq, domain)
    if (!userReq) return
    const userPersmission = userReq ?  await this.userRequestHandler(userReq) : null
    if (!userPersmission) throw new Error('3id-connect: Request not authorized')
  }

  async userPermissionRequest3id(req, domain) {
    const userPersmission = req ?  await this.userRequestHandler(req) : null
    if (!userPersmission) throw new Error('3id-connect: Request not authorized')
  }

  /**
  *  Creates an authSecret to add auth method 3ID
  */
  async authCreate (accountId) {
    const message = 'Add this account as a Ceramic authentication method'
    const authSecret = await this.authenticate(message)
    const entropy = sha256(authSecret.slice(2))

    this.storeAccount(accountId, entropy)

    return Uint8Array.from(Buffer.from(entropy, 'hex'))
  }

  /**
  *  Creates a publicly verifiable link between crypto account and 3id
  */
  async createLinkDoc (accountId) {
    const linkProofPromise = this.createLink(this.idw.id)

    const linkDoc = await this.ceramic.createDocument(
      'account-link',
      { metadata: { controllers: [accountId] } },
      { applyOnly: true }
    )
    const linkProof = await linkProofPromise
    await linkDoc.change({ content: linkProof })
    await this.ceramic.pin.add(linkDoc.id)

    const existingLinks = await this.idx.get('cryptoAccountLinks') || {}
    const links = Object.assign(existingLinks, { [accountId]: linkDoc.id.toUrl('base36') })
    await this.idx.set('cryptoAccountLinks', links)
    this.storeDIDLinks(this.idw.id, [accountId])
  }

  async requestHandler(message) {
    const domain = new Url(document.referrer).host

    const responsePromise = new Promise(async (resolve) => {
      // Register request cancel calback
      this.cancel(() => resolve(rpcError(message.id)))

      if(message.method.startsWith('did')) {
        const res = await this.requestHandlerDid(message, domain)
        return resolve(res)
      }

      if(message.method.startsWith('3id')) {
        const res = await this.requestHandler3id(message, domain)
        return resolve(res)
      }

      // else error
    })

    return JSON.stringify(await responsePromise)
  }

  /**
    *  Consumes DID RPC request message and relays to IDW didprovider instance. Also handles
    *  logic to retry requests and cancel requests.
    *
    * @param     {Object}      message    DID RPC request message
    * @return    {String}                 response message string
    */

  async requestHandlerDid(message, domain) {
    if (message.method === 'did_authenticate') {
      return this._didAuthReq(message, domain)
    } else {
      return  this._relayDidReq(message, domain)
    }
  }

  async requestHandler3id(message) {
    //TODO throw if not selfid or localhost
    let res

    if (message.method === '3id_accounts') {
      res = await this._listAccounts(message)
    } else if (message.method === '3id_createAccount') {
      res = await this._createAccount(message)
    } else if (message.method === '3id_addAuthAndLink') {
      res = await this._addAuthAndLink(message)
    }

    // else error
    this.hideIframe()
    return res
  }


  async _listAccounts() {
    // TODO ask user for permission in future
    const accounts = this.getDIDLinksList()
    return { result: accounts }
  }

  async _createAccount(message, domain) {
    const req = {
      type: 'create'
    }
    const accountId = message.params.accountId
    await this.userPermissionRequest3id(req, domain)
    // TODO throw if account already exist
    
    const authSecret = await this.authCreate(accountId)
    await this.initIdentity(authSecret, accountId)
    await this.tryCreateLink(accountId)

    return { result: true }
  }

  // TODO change name
  async _addAuthAndLink(message, domain) {
    const accountId = message.params.accountId
    const baseDid = message.params.baseDid

    const req = {
      type: 'link',
      baseDid,
      accountId
    }

    await this.userPermissionRequest3id(req, domain)

    const authSecret = this.getStoredAccountByDid(baseDid)
    const authSecretAdd = await this.authCreate(accountId)
    await this.initIdentity(authSecret, accountId)
    await this.tryCreateLink(accountId)
    await this.addAuth(accountId, authSecretAdd)
    
    return { result: true }
  }

  async _didAuthReq (message, domain) {
    try {
      const accountId = message.params.accountId
      if (this.activeAccount !== accountId) {
        await this.init(accountId, message, domain)
      }
      const res = await this.provider.send(message, domain)
      this.hideIframe()
      return res
    } catch (e) {
      if (e.toString().includes('authorized')) {
        this.hideIframe()
        return rpcError(message.id)
      } 
      this.errorCb(e, 'Error: Unable to connect')
    }
  }

  async _relayDidReq (message, domain) {
    return this.provider.send(message, domain)
  }

  /**
  *  Looks up if accountId is linked to did
  */
 async _resolveLink (accountId) {
    const doctype = 'account-link'
    const content =  { metadata: { controllers: [accountId] } }
    const doc = await this.ceramic.createDocument(doctype, content, { applyOnly: true })
    const linkDoc = await this.ceramic.loadDocument(doc.id)
    return linkDoc.content
  }

  storeAccount (accountId, authSecretHex) {
    const accounts = store.get(ACCOUNT_KEY) || {}
    accounts[accountId] =  authSecretHex
    store.set(ACCOUNT_KEY, accounts)
  }

  // TODO any storage state should handle multiple windows, could cause problems here
  setActiveAccount(accountId) {
    this.activeAccount = accountId
    store.set(ACTIVE_ACCOUNT_KEY, accountId)
  }

  getActiveAccount() {
    return store.get(ACTIVE_ACCOUNT_KEY)
  }

  getStoredAccount (accountId) {
    const accounts = store.get(ACCOUNT_KEY) || {}
    return accounts[accountId] ? Uint8Array.from(Buffer.from(accounts[accountId], 'hex')) : null
  }

  getStoredAccounts (accountId) {
    return store.get(ACCOUNT_KEY) || {}
  }

  getStoredAccountByDid (did) {
    const links = this.getDIDLinks(did) || []
    console.log(links)
    const accounts = this.getStoredAccounts()
    console.log(accounts)
    if (links.length == 0 ) throw new Error('Account does not exist')
    const accountId = links.find(e => Boolean(accounts[e]))
    console.log(accountId)
    return Uint8Array.from(Buffer.from(accounts[accountId], 'hex'))
  }


  getStoredAccountList() {
    const val = store.get(ACCOUNT_KEY)
    return val ? Object.keys(val) : null
  }

  storeDIDLinks(did, linkArray = []) {
    const dids = store.get(LINK_KEY) || {}
    const didsArr = dids[did] || []
    const arr = didsArr.concat(linkArray.filter(i => didsArr.indexOf(i) < 0))
    dids[did] = arr
    store.set(LINK_KEY, dids)
  }

  getDIDLinks(did) {
    const dids = store.get(LINK_KEY) || {}
    return dids[did]
  }

  getDIDLinksList() {
    return store.get(LINK_KEY) || {}
  }

  getDIDs() {
    const val = store.get(LINK_KEY)
    return val ? Object.keys(val) : null
  }

  _createUserRequest (req, origin) {
    if (this.idw) {
      const has = req.params.paths ? this.idw.permissions.has(origin, req.params.paths) : true
      if (has) return null
    }

    return {
      type: 'authenticate',
      origin,
      paths: req.params.paths || [],
    }
  }
}

export default ConnectService