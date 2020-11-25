import { expose, caller } from 'postmsg-rpc'
import { fakeIpfs } from 'identity-wallet/lib/utils'
const IdentityWallet = require('identity-wallet')
const Url = require('url-parse')
const store = require('store')
const { isLinked } = require('./utils')

const consentKey = (address, domain, space) => `3id_consent_${address}_${domain}_${space}`
const serializedKey = (address) => `serialized3id_${address}`

const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
const checkIsMobile = () => mobileRegex.test(navigator.userAgent)

/**
 *  ThreeIdConnectService runs an identity wallet instance and rpc server with
 *  bindings to receive and relay rpc messages to identity wallet
 */
class ConnectLegacyService {

  /**
    * Create ThreeIdConnectService
    */
  constructor () {
    this._registerDisplayListeners()
    this._registerExternalAuthListeners()
  }

  /**
   * Registers rpc call function for display and hiding iframe (Note: reverse of
   * idw rpc calls, this is rpc client, sending messages to parent window)
   * @private
   */
  _registerDisplayListeners () {
    this.display = caller('display', {postMessage: window.parent.postMessage.bind(window.parent)})
    this.hide = caller('hide', {postMessage: window.parent.postMessage.bind(window.parent)})
  }


  /**
   * Registers rpc call functions for handling external auth calls needed for IDW to parent window
   * @private
   */
  _registerExternalAuthListeners () {
    this.migration = caller('migration', {postMessage: window.parent.postMessage.bind(window.parent)})
    this.authenticate = caller('authenticate', {postMessage: window.parent.postMessage.bind(window.parent)})
    this.createLink = caller('createLink', {postMessage: window.parent.postMessage.bind(window.parent)})
  }


  /**
    *  External Authencation method for IDW
    *
    * @param     {Object}    params
    * @param     {String}    params.address     An ethereum address
    * @param     {Array}     params.spaces      Array of space strings
    * @param     {String}    params.type        Type of external auth request
    * @return    {Object}                       Response depends on type of request
  */
  async externalAuth({ address, spaces, type, did }) {
    let threeId
  	if (type === '3id_auth') {
      // TODO IMPLEMENT full migration
      const message = 'Add this account as a 3ID authentication method'
      return this.authenticate(message, address)
  	} else if (type === '3id_migration') {
      let new3id

      const cached3id = this._get3idState(address)

      if (!cached3id) {
        this.linkPromise = isLinked(address)
      }

      const diffSpaces = this._diff3idState(cached3id, address, spaces)

      let migration3id
      if (diffSpaces) {
        migration3id = await this.migration(diffSpaces, address)
        new3id = this._merge3idState(cached3id, JSON.parse(migration3id))
      } else {
        new3id = cached3id
      }
      const new3idSerialized = JSON.stringify(new3id)
      this._write3idState(new3idSerialized, address)
      return new3idSerialized
  	} else if (type === '3id_createLink' ) {
      if (this.linkPromise) {
        const link = await this.linkPromise
        if (!link) {
          return this.createLink(did, address)
        }
      }
    }
  }

  _write3idState(state, address) {
    store.set(serializedKey(address), state)
  }

  _get3idState(address) {
    const cached3id = store.get(serializedKey(address))
    return cached3id ? JSON.parse(cached3id) : null
  }

  _merge3idState (target, apply) {
    if (!target) return apply
    const res = Object.assign({}, target)
    res.spaceSeeds = Object.assign(target.spaceSeeds, apply.spaceSeeds || {})
    return res
  }

  _diff3idState (cached3id, address, spaces) {
    if (!cached3id) return spaces
    const cacheSpaces = Object.keys(cached3id.spaceSeeds)
    const diff = spaces.filter(x => !cacheSpaces.includes(x))
    return diff.length === 0 ? null : diff
  }

  /**
    *  Tells parent window to display iframe
    */
  async displayIframe() {
    return this.display(checkIsMobile())
  }

  /**
    *  Tells parent window to hide iframe
    */
  async hideIframe() {
    const root = document.getElementById('root')
    if (root) root.innerHTML = ``
    return this.hide()
  }

  /**
    *  Removes cache consents. For partial migration in instance consent function
    *  returns, but external auth to support consents fails. Refactored in future.
    *
    * @private
    * @param     {Object}    message    IDW rpc request message
    * @param     {String}    domain     Origin of caller/request
    * @return    {ThreeId}
    */
  _removeConsents(message, domain) {
    const spaces = [...message.params.spaces]
    const rootKeys = store.get(serializedKey(message.params.address))
    //TODO current root 'space', name
    if (!rootKeys) spaces.push('undefined')
    spaces.forEach(space => {
      const key = consentKey(message.params.address, domain, space)
      store.remove(key)
    })
  }

  /**
    *  Start identity wallet service. Once returns ready to receive rpc requests
    *
    * @param     {Web3Modal}   web3Modal    configured instance of web3modal
    * @param     {Function}    getConsent   get consent function, reference IDW
    * @param     {Function}    erroCB       Function to handle errors, function consumes error string (err) => {...}, called on errors
    * @param     {Function}    cancel       Function to cancel request, consumes callback, which is called when request is cancelled (cb) => {...}
    */
  start(getConsent, errorCb, cancel) {
    this.cancel = cancel
    this.errorCb = errorCb
    this.idWallet = new IdentityWallet(getConsent, { externalAuth: this.externalAuth.bind(this) })
    this.provider = this.idWallet.get3idProvider()
    expose('send', this.providerRelay.bind(this), {postMessage: window.parent.postMessage.bind(window.parent)})
  }

  /**
    *  Consumes IDW RPC request message and relays to IDW instance. Also handles
    *  logic to retry requests and cancel requests.
    *
    * @param     {Object}      message    IDW RPC request message
    * @return    {String}                 response message string
    */
  async providerRelay(message) {
    const domain = new Url(document.referrer).host

    const responsePromise = new Promise(async (resolve, reject) => {
      // Register request cancel calback
      // TODO could make all rpc errors match spec
      this.cancel(()=> {
        const res = {
          'id': message.id,
          'json-rpc': '2.0',
          error: "3id-connect: Request not authorized"
        }
        resolve(res)
      })

      if (message.method === '3id_authenticate') {
        try {
          const res = await this.provider.send(message, domain)
          this.hideIframe()
          resolve(res)
        } catch (e) {
          this.errorCb(e, 'Error: Unable to connect')
          this._removeConsents(message, domain)
        }
      } else {
        const res = await this.provider.send(message, domain)
        resolve(res)
      }
    })

    return JSON.stringify(await responsePromise)
  }
}

export default ConnectLegacyService
