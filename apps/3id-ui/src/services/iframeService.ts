import { DisplayConnectClientRPC } from '@3id/connect-display'
//@ts-ignore - todo: create type for this
import { expose } from 'postmsg-rpc'
import type { RPCMethods, RPCRequest } from 'rpc-utils'

// const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
// const checkIsMobile = () => mobileRegex.test(navigator.userAgent)

/**
 *  Iframe services binds functions to make calls to parent window for controlling iframe visibility
 *  and authProvider calls. It also runs rpc server to receive and realay request to another service.
 */

//  TODO can just merge this back with connect service, this will just be init all rpc clients/servers needed
export class IframeService<Methods extends RPCMethods> {
  display: (isMobile?: boolean, height?: string, width?: string) => Promise<void>
  // displayTest = (isMobile?: boolean, height?: string, width?: string):Promise<void> => {

  // }
  hide: () => Promise<void>
  iframeDisplay: DisplayConnectClientRPC

  /**
   * Create IframeService
   */
  constructor() {
    this.iframeDisplay = new DisplayConnectClientRPC(window.parent)
    this.display = this.iframeDisplay.display.bind(this.iframeDisplay)
    this.hide = this.iframeDisplay.hide.bind(this.iframeDisplay)
  }

  /**
   *  Start service, binds handler to start receiving incoming requests
   *
   * @param     {Function}    requestHandler    a function that will consume all rpc request from parent window (specifically didProvider calls)
   */
  // TODO replace this as well for did provider
  start(requestHandler: (message: RPCRequest<Methods, keyof Methods>) => Promise<string>): void {
    expose('send', requestHandler, { postMessage: window.parent.postMessage.bind(window.parent) })
  }

  /**
   *  Tells parent window to display iframe
   */
  // async displayIframe(res: boolean): Promise<boolean> {
  //   console.log('display iframe', res)
  //   await this.display(false, '100%', '100%') //checkIsMobile()
  //   return res
  // }
  async displayIframe(): Promise<boolean> {
    await this.display(false, '100%', '100%') //checkIsMobile()
    return true
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
