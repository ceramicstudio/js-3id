import { expose } from 'postmsg-rpc'
import type { RPCRequest } from 'rpc-utils'
import { DisplayClientRPC } from './iframeDisplay'

const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
const checkIsMobile = () => mobileRegex.test(navigator.userAgent)

/**
 *  Iframe services binds functions to make calls to parent window for controlling iframe visibility
 *  and authProvider calls. It also runs rpc server to receive and realay request to another service.
 */

//  TODO can just merge this back with connect service, this will just be init all rpc clients/servers needed 
class IframeService {
  display: (isMobile?: boolean, height?:string, width?:string) => Promise<void>
  hide: () => Promise<void>
  iframeDisplay: DisplayClientRPC

  /**
   * Create IframeService
   */
  constructor() {
    this.iframeDisplay = new DisplayClientRPC(window.parent)
    this.display = this.iframeDisplay.display
    this.hide = this.iframeDisplay.hide
  }

  /**
   *  Start service, binds handler to start receiving incoming requests
   *
   * @param     {Function}    requestHandler    a function that will consume all rpc request from parent window (specifically didProvider calls)
   */
  // TODO replace this as well for did provider 
  start(
    requestHandler: (message: RPCRequest<string, Record<string, unknown>>) => Promise<string>
  ): void {
    expose('send', requestHandler, { postMessage: window.parent.postMessage.bind(window.parent) })
  }

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
