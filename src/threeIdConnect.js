import ThreeIdProviderProxy from './threeIdProviderProxy.js'
import { expose } from 'postmsg-rpc'
import EthereumAuthProvider from './authProvider/ethereumAuthProvider.js'
import { fakeIpfs } from 'identity-wallet/lib/utils'

const IDENTITY_WALLET_IFRAME_URL = 'https://connect.3box.io'

const HIDE_IFRAME_STYLE = 'position: fixed; width:0; height:0; border:0; border:none !important'
const DISPLAY_IFRAME_STYLE = 'border:none border:0; z-index: 500; position: fixed; max-width: 100%;'
const IFRAME_TOP = `top: 10px; right: 10px`
const IFRAME_BOTTOM = `bottom: 0px; left: 0px;`

const hide = (iframe) => () => iframe.style = HIDE_IFRAME_STYLE
const display = (iframe) => (mobile = false, height = '245px', width = '440px') => iframe.style = `${DISPLAY_IFRAME_STYLE} width: ${width}; height: ${height}; ${mobile ? IFRAME_BOTTOM: IFRAME_TOP}`
// TODO maybe have some more ui options here, because these can change after iframe loads

/**
 *  ThreeIdConnect provides interface for loading and instantiating IDW iframe,
 *  and provides a 3ID provider interface to send requests to iframe. Acts like
 *  rpc client.
 */
class ThreeIdConnect {

  /**
    *  Creates ThreeIdConnect. Create and loads iframe. Should be instantiated
    *  on page load.
    *
    * @param     {String}    iframeUrl   iframe url, defaults to 3id-connect iframe service
    */
  constructor (iframeUrl) {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      throw new Error('ThreeIdConnect not supported in this enviroment')
    }

    this.iframe = document.createElement('iframe')
    this.iframe.src = iframeUrl || IDENTITY_WALLET_IFRAME_URL
    this.iframe.style = HIDE_IFRAME_STYLE
    this.iframe.allowTransparency = true
    this.iframe.frameBorder = 0

    this.iframeLoadedPromise = new Promise((resolve, reject) => {
      this.iframe.onload = () => { resolve() }
    })

    document.body.appendChild(this.iframe)
  }

  // Just passing ref to threeId and ipfs during migration
  async connect (provider, ThreeId, ipfs) {
    // assumes eth provider during migration
    this.provider = provider
    this.ThreeId = ThreeId
    this.ipfs = ipfs
    // after migration, can detect different provdier to create authProvider
    this.authProvider = new EthereumAuthProvider(provider)
  }

  /**
    *  Handlers to consumer message to hide or display iframe
    *
    * @private
    */
  _registerDisplayHandlers () {
    expose('display', display(this.iframe), {postMessage: this.postMessage})
    expose('hide', hide(this.iframe), {postMessage: this.postMessage})
  }

  /**
    *  Handlers to consume messages for authProvider
    *
    * @private
    */
  _registerAuthHandlers () {
    expose('authenticate', this.authenticate.bind(this), {postMessage: this.postMessage})
    expose('migration', this.migration.bind(this), {postMessage: this.postMessage})
    expose('createLink', this.createLink.bind(this), {postMessage: this.postMessage})
  }

  /**
    *  Returns ThreeId instance, used for migration of legacy 3boxjs accounts
    *
    * @private
    * @param     {String}    address     An ethereum address
    * @return    {ThreeId}
    */
  async _getThreeId (address) {
    if(!this._threeId) {
      this._threeId = await this.ThreeId.getIdFromEthAddress(address, this.provider, this.ipfs, undefined, {})
    }
    return this._threeId
  }

  async authenticate(message, address) {
    return this.authProvider.authenticate(message, address)
  }

  async migration(spaces, address) {
    const threeId = await this._getThreeId(address)
    await threeId.authenticate(spaces)
    return threeId.serializeState()
  }

  async createLink(did, address) {
    return this.authProvider.createLink(did, address)
  }

  /**
    *  Returns a 3ID provider, which can send and receive 3ID messages from iframe
    *
    * @return    {ThreeIdProviderProxy}     A 3ID provider
    */
  async get3idProvider() {
    await this.iframeLoadedPromise
    this.postMessage = this.iframe.contentWindow.postMessage.bind(this.iframe.contentWindow)
    this._registerDisplayHandlers()
    this._registerAuthHandlers()
    return new ThreeIdProviderProxy(this.postMessage)
  }
}

export default ThreeIdConnect
