const ThreeIdProviderProxy = require('./threeIdProviderProxy.js').default
import { expose } from 'postmsg-rpc'

// TODO CHANGE
const IDENTITY_WALLET_IFRAME_URL = 'http://127.0.0.1:30001/'

const HIDE_IFRAME_STYLE = 'width:0; height:0; border:0; border:none !important'
const DISPLAY_IFRAME_STYLE = 'border:none border:0; z-index: 999999; position: fixed;'

const hide = (iframe) => () => iframe.style = HIDE_IFRAME_STYLE
const display = (iframe) => (height = '100%', width = '100%', top = '0', left= '0') => iframe.style = `${DISPLAY_IFRAME_STYLE} width: ${width}; height: ${height}; top: ${top}; left: ${left};`

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
    this.iframe.frameBorder = 0

    this.iframeLoadedPromise = new Promise((resolve, reject) => {
      this.iframe.onload = () => { resolve() }
    })

    document.body.appendChild(this.iframe)
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
    *  Returns a 3ID provider, which can send and receive 3ID messages from iframe
    *
    * @return    {ThreeIdProviderProxy}     A 3ID provider
    */
  async get3idProvider() {
    await this.iframeLoadedPromise
    this.postMessage = this.iframe.contentWindow.postMessage.bind(this.iframe.contentWindow)
    this._registerDisplayHandlers()
    return new ThreeIdProviderProxy(this.postMessage)
  }
}

export default ThreeIdConnect
