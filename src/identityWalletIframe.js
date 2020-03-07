const ThreeIdProviderProxy = require('./threeIdProviderProxy.js').default
import { expose } from 'postmsg-rpc'

const IDENTITY_WALLET_IFRAME_URL = 'http://127.0.0.1:30001/'
// TODO move all css in seperate templating
const HIDE_IFRAME_STYLE = 'width:0; height:0; border:0; border:none !important'
const DISPLAY_IFRAME_STYLE = 'position: fixed; margin-top: 10%; margin-left: 20%; z-index: 999999; width: 40%; height: 30%; top: 0; left: 0;'

const hide = (iframe) => () => iframe.style = HIDE_IFRAME_STYLE
const display = (iframe) => () => iframe.style = DISPLAY_IFRAME_STYLE

// Iframe logic may move if same used as data layer
class IdentityWalletIframe {
  constructor (iframeUrl) {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      throw new Error('IdentityWalletIframe not supported in this enviroment')
    }

    this.iframe = document.createElement('iframe')
    this.iframe.src = iframeUrl || IFRAME_STORE_URL
    this.iframe.style = HIDE_IFRAME_STYLE

    this.iframeLoadedPromise = new Promise((resolve, reject) => {
      this.iframe.onload = () => { resolve() }
    })

    document.body.appendChild(this.iframe)
  }

  _registerDisplayHandlers () {
    expose('display', display(this.iframe), {postMessage: this.postMessage})
    expose('hide', hide(this.iframe), {postMessage: this.postMessage})
  }

  async get3idProvider() {
    await this.iframeLoadedPromise
    this.postMessage = this.iframe.contentWindow.postMessage.bind(this.iframe.contentWindow)
    this._registerDisplayHandlers()
    return new ThreeIdProviderProxy(this.postMessage)
  }
}

export default IdentityWalletIframe
