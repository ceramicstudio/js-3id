import { expose, caller } from 'postmsg-rpc'

const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
const checkIsMobile = () => mobileRegex.test(navigator.userAgent)

/**
 *  Iframe services binds functions to make calls to parent window for controlling iframe visibility
 *  and authProvider calls. It also runs rpc server to receive and realay request to another service.
 */

class IframeService {

  /**
    * Create IframeService
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
    this.authenticate = caller('authenticate', {postMessage: window.parent.postMessage.bind(window.parent)})
    this.createLink = caller('createLink', {postMessage: window.parent.postMessage.bind(window.parent)})
  }


  /**
  *  Start service, binds handler to start receiving incoming requests 
  *
  * @param     {Function}    requestHandler    a function that will consume all rpc request from parent window (specifically didProvider calls)
  */
  async start(requestHandler) {
    expose('send', requestHandler, {postMessage: window.parent.postMessage.bind(window.parent)})
  }

  /**
  *  Authenticate Request to authProvider in parent window
  *
  * @param     {String}    message      authentication message
  * @param     {String}    accountId    external account ID handling authentication message
  * @return    {Promise<String>}        AuthSecret - 32 byte string
  */
  async authenticate(message, accountId) {
    return this.authenticate(message, accountId)
  }

  /**
  * CreateLink Request to authProvider in parent window
  *
  * @param     {String}    did          did which is being linked
  * @param     {String}    accountId    external account ID handling authentication message
  * @return    {Promise<Object>}        linkProof
  */

 async createLink(did, accountId) {
    return this.createLink(did, accountId)
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
}

export default IframeService