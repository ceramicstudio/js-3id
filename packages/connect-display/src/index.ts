/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createClient, createServer } from '@ceramicnetwork/rpc-window'
import type { ServerPayload } from '@ceramicnetwork/rpc-window'
import type { Wrapped } from '@ceramicnetwork/transport-subject'
import type { IncomingMessage } from '@ceramicnetwork/transport-postmessage'
import { createMessageObservable } from '@ceramicnetwork/transport-postmessage'
import type { RPCClient, RPCMethodTypes } from 'rpc-utils'
import type { Observable } from 'rxjs'
import { first } from 'rxjs/operators'

const IFRAME_NAMESPACE = '3id-connect-iframedisplay' as const
const MANAGE_NAMESPACE = '3id-connect-managedisplay' as const

const TORUS_CONSENT_ZINDEX = 99999

const HIDE_IFRAME_STYLE = 'position: fixed; width:0; height:0; border:0; border:none !important'
const DISPLAY_IFRAME_STYLE = `border:none; border:0; z-index: ${
  TORUS_CONSENT_ZINDEX - 2
}; position: fixed; max-width: 100%;`
const DISPLAY_MANAGE_STYLE = `border:none; border:0; z-index: ${
  TORUS_CONSENT_ZINDEX - 1
}; position: fixed; width: 100%; height: 100%; top: 0; left: 0;`
const IFRAME_TOP = `top: 0px; right: 0px`
const IFRAME_BOTTOM = `bottom: 0px; left: 0px;`

// @ts-ignore
const hide = (iframe: HTMLIFrameElement) => () => (iframe.style = HIDE_IFRAME_STYLE)
const display =
  (iframe: HTMLIFrameElement) =>
  (mobile = false, height = '245px', width = '440px') => {
    // @ts-ignore
    iframe.style = `${DISPLAY_IFRAME_STYLE} width: ${width}; height: ${height}; ${
      mobile ? IFRAME_BOTTOM : IFRAME_TOP
    }`
  }

type DisplayConnectMethods = {
  hide: RPCMethodTypes
  display: {
    params: {
      mobile?: boolean
      height?: string
      width?: string
    }
  }
}

export class DisplayConnectClientRPC {
  client: RPCClient<DisplayConnectMethods>

  constructor(target: Window = window.parent) {
    this.client = createClient<DisplayConnectMethods>(IFRAME_NAMESPACE, target)
  }

  async hide(): Promise<void> {
    await this.client.request('hide')
  }

  async display(mobile?: boolean, height?: string, width?: string): Promise<void> {
    await this.client.request('display', { mobile, height, width })
  }
}

export type ConnectPayload = ServerPayload<DisplayConnectMethods, '3id-connect-iframedisplay'>

export function createDisplayConnectServerRPC(
  iframe: HTMLIFrameElement
): Observable<ConnectPayload> {
  const callDisplay = display(iframe)
  const callHide = hide(iframe)

  return createServer<DisplayConnectMethods, '3id-connect-iframedisplay'>(IFRAME_NAMESPACE, {
    hide: () => {
      callHide()
    },
    display: (_event, { mobile, height, width }) => {
      callDisplay(mobile, height, width)
    },
  })
}

export const createConnectIframe = (iframeUrl: string): HTMLIFrameElement => {
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

type DisplayManageMethods = {
  display: {
    params: {
      accountId: string
    }
  }
}
export class DisplayManageClientRPC {
  client: RPCClient<DisplayManageMethods>

  constructor(target: Window = window.parent) {
    this.client = createClient<DisplayManageMethods>(MANAGE_NAMESPACE, target)
  }

  async display(accountId: string): Promise<void> {
    await this.client.request('display', { accountId })
  }
}

export type ManagePayload = ServerPayload<DisplayManageMethods, '3id-connect-managedisplay'>

export function createDisplayManageServerRPC(manageAppUrl: string): Observable<ManagePayload> {
  let app: HTMLIFrameElement

  return createServer<DisplayManageMethods, '3id-connect-managedisplay'>(MANAGE_NAMESPACE, {
    // todo change name
    display: async (_event, { accountId }) => {
      app = createManageIframe(`${manageAppUrl}?accountId=${accountId}`)
      document.body.appendChild(app)

      await new Promise((res) => {
        app.onload = res
      })
      // @ts-ignore
      const observer = createMessageObservable(window)

      const filterEvent = (x: IncomingMessage<Wrapped<string, string>>): boolean =>
        x.data.ns === '3id-connect-management'

      await observer.pipe(first(filterEvent)).toPromise()

      app.remove()
    },
  })
}

export const createManageIframe = (iframeUrl: string): HTMLIFrameElement => {
  const iframe = document.createElement('iframe')
  iframe.name = 'threeid-connect-manage'
  iframe.className = 'threeid-connect-manage'
  iframe.src = iframeUrl
  // @ts-ignore
  iframe.allowtransparency = false
  // @ts-ignore
  iframe.style = DISPLAY_MANAGE_STYLE
  return iframe
}
