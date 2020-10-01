const IdentityWallet = require('identity-wallet').default
const Url = require('url-parse')
const store = require('store')
import CeramicClient from '@ceramicnetwork/ceramic-http-client'
const sha256 = require('js-sha256').sha256
import { publishedDefinitions, publishedSchemas } from '@ceramicstudio/idx-tools'
import { IDX } from '@ceramicstudio/idx'
import IframeService from './iframeService.js'

const CERAMIC_API = 'https://ceramic.3boxlabs.com'
const accountsKey = 'accounts'

const rpcError = (id) => ({
  'id': id,
  'json-rpc': '2.0',
  error: "3id-connect: Request not authorized"
})

/**
 *  ThreeIdConnectService runs an identity wallet instance and rpc server with
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

  // TOOD refactor into more clear paths, too much implicit
  async init(accountId, authReq, domain) {

    let authSecret = this.getStoredAccount(accountId)
    let authId = accountId
    let authSecretAdd = null 
    const accounts = this.getStoredAccountList()

    if (!accounts) {
      const userReq = this._mapToUserRequest(authReq, domain)
      const userPersmission = userReq ?  await this.userRequestHandler(userReq) : null
      if (!userPersmission) throw new Error('3id-connect: Request not authorized')
      authSecret = await this.authCreate(accountId)
    } else if (!authSecret) {
      authId = await this.userRequestHandler({ type: "account", accounts }) // ui to select account, for now only option to link to existing account or not, no multi account
      authSecret = this.getStoredAccount(authId)
      authSecretAdd = this.authCreate(accountId)
    }

    // Same request relayed before idw handles it, if request reaches idw, then permission given
    const getPermission = () => true

    const config = {
      getPermission,
      ceramic: this.ceramic,
      authSecret, 
      authId
    }

    this.idWallet = await IdentityWallet.create(config)
    this.provider = this.idWallet.getDidProvider()
    await this.ceramic.setDIDProvider(this.provider)
    this.idx =  new IDX({ ceramic: this.ceramic, definitions: publishedDefinitions, schemas: publishedSchemas })

    if (authSecretAdd) {
      await this.idw.keychain.add(accountId, authSecretAdd)
      await this.idw.keychain.commit()
    }

    const links = await this.idx.get('cryptoAccountLinks')
    if (!(links && links[accountId])) await this.createLinkDoc(accountId) 

    if (accounts) {
      const userReq = this._mapToUserRequest(authReq, domain)
      if (!userReq) return
      const userPersmission = userReq ?  await this.userRequestHandler(userReq) : null
      if (!userPersmission) throw new Error('3id-connect: Request not authorized')
    }
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
    const linkProofPromise = this.createLink(this.idWallet.id)

    const linkDoc = await this.ceramic.createDocument(
      'account-link',
      { metadata: { owners: [accountId] } },
      { applyOnly: true }
    )
    const linkProof = await linkProofPromise
    await linkDoc.change({ content: linkProof })
    await this.ceramic.pin.add(linkDoc.id)
    await this.idx.set('cryptoAccountLinks', { [accountId]: linkDoc.id })
  }

  /**
    *  Consumes IDW RPC request message and relays to IDW instance. Also handles
    *  logic to retry requests and cancel requests.
    *
    * @param     {Object}      message    IDW RPC request message
    * @return    {String}                 response message string
    */

    // TODO refactor dispatcher, andn move some out 
  async requestHandler(message) {
    const domain = new Url(document.referrer).host

    const responsePromise = new Promise(async (resolve, reject) => {
      // Register request cancel calback
      this.cancel(() => resolve(rpcError(message.id)))

      if (message.method === 'did_authenticate') {

        if (!this.provider) {
          const accountId = message.params.accountId
          try {
            await this.init(accountId, message, domain)
          } catch(e) {
            if (e.toString().includes('authorized')) {
              this.hideIframe()
              resolve(rpcError(message.id))
              return
            } 
            this.errorCb(e, 'Error: Unable to connect')
            return
          }
        }

        try {
          const res = await this.provider.send(message, domain)
          this.hideIframe()
          resolve(res)
        } catch (e) {
          this.errorCb(e, 'Error: Unable to connect')
        }
      } else {
        const res = await this.provider.send(message, domain)
        resolve(res)
      }
    })

    return JSON.stringify(await responsePromise)
  }

  storeAccount (accountId, authSecretHex) {
    const accounts = store.get(accountsKey) || {}
    accounts[accountId] =  authSecretHex
    store.set(accountsKey, accounts)
  }

  getStoredAccount (accountId) {
    const accounts = store.get(accountsKey) || {}
    return accounts[accountId] ? Uint8Array.from(Buffer.from(accounts[accountId], 'hex')) : null
  }

  getStoredAccountList() {
    const val = store.get(accountsKey)
    return val ? Object.keys(val) : null
  }

  _mapToUserRequest (req, origin) {
    if (this.idWallet) {
      const has = req.params.paths ? this.idw.permissions.has(origin, req.params.paths) : true
      if (has) return null
    }

    return {
      type: 'authenticate',
      origin,
      payload: req.params.paths ? { paths: req.params.paths } : {},
    }
  }
}

export default ConnectService