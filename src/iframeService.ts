import type { LinkProof } from '3id-blockchain-utils'
import { expose, caller } from 'postmsg-rpc'
import type { RPCRequest } from 'rpc-utils'

const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
const checkIsMobile = () => mobileRegex.test(navigator.userAgent)

/**
 *  Iframe services binds functions to make calls to parent window for controlling iframe visibility
 *  and authProvider calls. It also runs rpc server to receive and realay request to another service.
 */

class IframeService {
  display: (isMobile: boolean) => Promise<void>
  hide: () => Promise<void>

  /**
   * Create IframeService
   */
  constructor() {
    const postMessage = window.parent.postMessage.bind(window.parent)

    /**
     * Registers rpc call function for display and hiding iframe (Note: reverse of
     * idw rpc calls, this is rpc client, sending messages to parent window)
     */
    this.display = caller('display', { postMessage })
    this.hide = caller('hide', { postMessage })

    /**
     * Registers rpc call functions for handling external auth calls needed for IDW to parent window
     */
    this.authenticate = caller('authenticate', { postMessage })
    this.createLink = caller('createLink', { postMessage })
  }

  /**
   *  Start service, binds handler to start receiving incoming requests
   *
   * @param     {Function}    requestHandler    a function that will consume all rpc request from parent window (specifically didProvider calls)
   */
  start(requestHandler: (message: RPCRequest) => Promise<string>): void {
    expose('send', requestHandler, { postMessage: window.parent.postMessage.bind(window.parent) })
  }

  /**
   *  Authenticate Request to authProvider in parent window
   *
   * @param     {String}    message      authentication message
   * @param     {String}    accountId    external account ID handling authentication message
   * @return    {Promise<String>}        AuthSecret - 32 byte string
   */
  authenticate: (message: string, accountId?: string) => Promise<string>

  /**
   * CreateLink Request to authProvider in parent window
   *
   * @param     {String}    did          did which is being linked
   * @param     {String}    accountId    external account ID handling authentication message
   * @return    {Promise<Object>}        linkProof
   */
  createLink: (did: string, accountId?: string) => Promise<LinkProof>

  /**
   *  Tells parent window to display iframe
   */
  async displayIframe(): Promise<void> {
    return await this.display(checkIsMobile())
  }

  /**
   *  Tells parent window to hide iframe
   */
  async hideIframe(): Promise<void> {
    const root = document.getElementById('root')
    if (root) root.innerHTML = ``
    return await this.hide()
  }
}

export default IframeService
