import DIDProviderProxy from './didProviderProxy.js'
import { expose } from 'postmsg-rpc'

// TODO anyway to have default ceramic
const IDENTITY_WALLET_IFRAME_URL = 'https://3idconnect.org/index.html'

const HIDE_IFRAME_STYLE = 'position: fixed; width:0; height:0; border:0; border:none !important'
const DISPLAY_IFRAME_STYLE = 'border:none border:0; z-index: 500; position: fixed; max-width: 100%;'
const IFRAME_TOP = `top: 10px; right: 10px`
const IFRAME_BOTTOM = `bottom: 0px; left: 0px;`

const hide = (iframe) => () => iframe.style = HIDE_IFRAME_STYLE
const display = (iframe) => (mobile = false, height = '245px', width = '440px') => iframe.style = `${DISPLAY_IFRAME_STYLE} width: ${width}; height: ${height}; ${mobile ? IFRAME_BOTTOM: IFRAME_TOP}`

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

  async connect (provider) {
      // TODO DETECTION ON CAP10,  consume auth provider or other providers
      // just consume any providers and then create auth provider here, at very least has to support 3box
    this.authProvider = provider
    this.accountId = this.authProvider.accountId
    await this.iframeLoadedPromise
    this.postMessage = this.iframe.contentWindow.postMessage.bind(this.iframe.contentWindow)
    this._registerDisplayHandlers()
    this._registerAuthHandlers()
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
    expose('createLink', this.createLink.bind(this), {postMessage: this.postMessage})
  }

  async authenticate(message, accountId) {
    return this.authProvider.authenticate(message, accountId)
  }

  async createLink(did, accountId) {
    return this.authProvider.createLink(did, accountId)
  }

  /**
    *  Returns a DID provider, which can send and receive messages from iframe
    *
    * @return    {DIDProviderProxy}     A DID provider
    */
  async getDidProvider() {
    return new DIDProviderProxy(this.postMessage, this.authProvider.accountId)
  }
}

export default ThreeIdConnect
