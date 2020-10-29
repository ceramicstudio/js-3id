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
  }

  // Simplified Assumptions
  // loads from given auth secret if given no other, idw handles if new or existing account
  // can only add accounts to existing in iframe, no way to lookup other accounts or add then link
  // only one 3id account in iframe, single option to link to existing account or not and continue
  // linking means add auth method and public link right now, but can unbundle

  async init(accountId, authReq, domain) {
    let authSecret = this.getStoredAccount(accountId)
    const accounts = this.getStoredAccountList()

    const accountAlreadyExist = Boolean(authSecret)
    const firstAccount = !Boolean(accounts)
    const otherAccountsExist = !Boolean(authSecret) && Boolean(accounts)

    let authId = accountId
    let authSecretAdd = null
    
    if (firstAccount) {
      await this.userPermissionRequest(authReq, domain)
      authSecret = await this.authCreate(accountId)
    }

    if (otherAccountsExist) {
      // ui to select account, for now only option to link to existing account or not, no multi account, accounts would be 3id acounts after
      // Returns true or false for now, and just get any existing account, but could return actual dids
      const linkHuh = await this.userRequestHandler({ type: "account", accounts }) 
      if (linkHuh) {
        authId = accounts[0]
        authSecret = this.getStoredAccount(authId)
        authSecretAdd = await this.authCreate(accountId)
      }
    }

    // Same request relayed before idw handles it, if request reaches idw, then permission given
    const getPermission = () => true

    this.idw = await IdentityWallet.create({ getPermission, ceramic: this.ceramic, authSecret, authId })
    this.provider = this.idw.getDidProvider()
    await this.ceramic.setDIDProvider(this.provider)
    this.idx =  new IDX({ ceramic: this.ceramic, definitions })

    if (otherAccountsExist && authSecretAdd) {
      await this.idw.keychain.add(accountId, authSecretAdd)
      await this.idw.keychain.commit()
    }

    if (firstAccount || authSecretAdd || accountAlreadyExist) {
      const links = await this.idx.get('cryptoAccountLinks')
      if (!(links && links[accountId])) await this.createLinkDoc(accountId) 
    }

    if (!firstAccount) await this.userPermissionRequest(authReq, domain)
  }

  async userPermissionRequest(authReq, domain) {
    const userReq = this._createUserRequest(authReq, domain)
    if (!userReq) return
    const userPersmission = userReq ?  await this.userRequestHandler(userReq) : null
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
    await this.idx.set('cryptoAccountLinks', { [accountId]: linkDoc.id.toUrl('base36') })
  }

  /**
    *  Consumes DID RPC request message and relays to IDW didprovider instance. Also handles
    *  logic to retry requests and cancel requests.
    *
    * @param     {Object}      message    DID RPC request message
    * @return    {String}                 response message string
    */

  async requestHandler(message) {
    const domain = new Url(document.referrer).host

    const responsePromise = new Promise(async (resolve) => {
      // Register request cancel calback
      this.cancel(() => resolve(rpcError(message.id)))

      if (message.method === 'did_authenticate') {
        const res = await this._didAuthReq(message, domain)
        if (res) resolve(res)
      } else {
        const res = await this._relayDidReq(message, domain)
        if (res) resolve(res)
      }
    })

    return JSON.stringify(await responsePromise)
  }

  async _didAuthReq (message, domain) {
    try {
      if (!this.provider) {
        const accountId = message.params.accountId
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

  storeAccount (accountId, authSecretHex) {
    const accounts = store.get(ACCOUNT_KEY) || {}
    accounts[accountId] =  authSecretHex
    store.set(ACCOUNT_KEY, accounts)
  }

  getStoredAccount (accountId) {
    const accounts = store.get(ACCOUNT_KEY) || {}
    return accounts[accountId] ? Uint8Array.from(Buffer.from(accounts[accountId], 'hex')) : null
  }

  getStoredAccountList() {
    const val = store.get(ACCOUNT_KEY)
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