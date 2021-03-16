import type { RPCClient, RPCMethodTypes } from 'rpc-utils'
import type { PostMessageTarget } from '@ceramicnetwork/transport-postmessage'
import type { Subscription } from 'rxjs'

import { createClient, createServer } from './iframeRPC'

const NAMESPACE = '3id-connect-iframedisplay' as const

const HIDE_IFRAME_STYLE = 'position: fixed; width:0; height:0; border:0; border:none !important'
const DISPLAY_IFRAME_STYLE = 'border:none border:0; z-index: 500; position: fixed; max-width: 100%;'
const IFRAME_TOP = `top: 10px; right: 10px`
const IFRAME_BOTTOM = `bottom: 0px; left: 0px;`

// @ts-ignore
const hide = (iframe: HTMLIFrameElement) => () => (iframe.style = HIDE_IFRAME_STYLE)
const display = (iframe: HTMLIFrameElement) => (
  mobile = false,
  height = '245px',
  width = '440px'
) => {
  // @ts-ignore
  iframe.style = `${DISPLAY_IFRAME_STYLE} width: ${width}; height: ${height}; ${
    mobile ? IFRAME_BOTTOM : IFRAME_TOP
  }`
}

type DisplayMethods = {
  hide: RPCMethodTypes
  display: {
    params: {
      mobile?: boolean
      height?: string
      width?: string
    }
  }
}
export class DisplayClientRPC {
  client: RPCClient<DisplayMethods>

  constructor(target?: PostMessageTarget) {
    this.client = createClient<DisplayMethods>(NAMESPACE, target)
  }

  async hide(): Promise<void> {
    await this.client.request('hide')
  }

  async display(mobile?: boolean, height?: string, width?: string): Promise<void> {
    await this.client.request('display', { mobile, height, width })
  }
}

export const DisplayServerRPC = (iframe: HTMLIFrameElement): Subscription => {
  const callDisplay = display(iframe)
  const callHide = hide(iframe)

  return createServer<DisplayMethods>(NAMESPACE, {
    hide: () => {
      callHide()
    },
    display: (_event, { mobile, height, width }) => {
      callDisplay(mobile, height, width)
    },
  }).subscribe({
    error(msg) {
      console.error('display server error', msg)
    },
  })
}

export const createIframe = (iframeUrl: string): HTMLIFrameElement => {
  const iframe = document.createElement('iframe')
  iframe.name = 'threeid-connect'
  iframe.className = 'threeid-connect'
  iframe.src = iframeUrl
  // @ts-ignore
  iframe.style = HIDE_IFRAME_STYLE
  // @ts-ignore
  iframe.allowTransparency = true
  // @ts-ignore
  iframe.frameBorder = 0
  return iframe
}
