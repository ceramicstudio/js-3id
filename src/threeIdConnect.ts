import type { LinkProof } from '3id-blockchain-utils'
import { expose, caller } from 'postmsg-rpc'
import { RPCClient } from 'rpc-utils'
import type { RPCConnection, RPCRequest } from 'rpc-utils'

import type AuthProvider from './authProvider/ethereumAuthProvider'
import DIDProviderProxy from './didProviderProxy'
import type { DIDLinksList } from './types'

const CONNECT_IFRAME_URL = process.env.CONNECT_IFRAME_URL || 'https://app.3idconnect.org'

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

type PostMessage = (
  message: any,
  targetOrigin: string,
  transfer?: Array<Transferable> | undefined
) => void

const createRPCProvider = (postMessage: PostMessage): RPCConnection => {
  const sendRPC = caller<[RPCRequest<string, any>], string>('send', { postMessage })
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    send: async (req) => JSON.parse(await sendRPC(req as any)),
  }
}

/**
 *  ThreeIdConnect provides interface for loading and instantiating IDW iframe,
 *  and provides a 3ID provider interface to send requests to iframe. Acts like
 *  rpc client.
 */
class ThreeIdConnect {
  iframe: HTMLIFrameElement
  iframeLoadedPromise: Promise<void>
  postMessage: PostMessage | undefined

  RPCProvider: RPCConnection | undefined
  RPCClient: RPCClient | undefined

  authProvider: AuthProvider | undefined
  accountId: string | undefined

  _connected = false

  /**
   *  Creates ThreeIdConnect. Create and loads iframe. Should be instantiated
   *  on page load.
   *
   * @param     {String}    iframeUrl   iframe url, defaults to 3id-connect iframe service
   */
  constructor(iframeUrl?: string) {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      throw new Error('ThreeIdConnect not supported in this enviroment')
    }

    this.iframe = document.createElement('iframe')
    this.iframe.name = 'threeid-connect'
    this.iframe.className = 'threeid-connect'
    this.iframe.src = iframeUrl || CONNECT_IFRAME_URL
    // @ts-ignore
    this.iframe.style = HIDE_IFRAME_STYLE
    // @ts-ignore
    this.iframe.allowTransparency = true
    // @ts-ignore
    this.iframe.frameBorder = 0

    this.iframeLoadedPromise = new Promise((resolve) => {
      this.iframe.onload = () => {
        resolve()
      }
    })

    document.body.appendChild(this.iframe)
  }

  async connect(provider: AuthProvider): Promise<void> {
    // TODO DETECTION ON CAP10,  consume auth provider or other providers
    // just consume any providers and then create auth provider here, at very least has to support 3box
    if (provider) {
      this.setAuthProvider(provider)
    }
    await this.iframeLoadedPromise
    this.postMessage = this.iframe.contentWindow!.postMessage.bind(this.iframe.contentWindow)
    this._registerDisplayHandlers()
    this._registerAuthHandlers()
    this.RPCProvider = createRPCProvider(this.postMessage)
    this.RPCClient = new RPCClient(this.RPCProvider)
    this._connected = true
  }

  setAuthProvider(authProvider: AuthProvider): void {
    this.authProvider = authProvider
    this.accountId = this.authProvider.accountId
  }

  get connected(): boolean {
    return this._connected
  }

  /**
   *  Handlers to consumer message to hide or display iframe
   *
   * @private
   */
  _registerDisplayHandlers(): void {
    expose('display', display(this.iframe), { postMessage: this.postMessage })
    expose('hide', hide(this.iframe), { postMessage: this.postMessage })
  }

  /**
   *  Handlers to consume messages for authProvider
   *
   * @private
   */
  _registerAuthHandlers(): void {
    expose('authenticate', this._authenticate.bind(this), { postMessage: this.postMessage })
    expose('createLink', this._createLink.bind(this), { postMessage: this.postMessage })
  }

  async _authenticate(message: string, accountId?: string): Promise<string> {
    return await this.authProvider!.authenticate(message, accountId)
  }

  async _createLink(did: string, accountId?: string): Promise<LinkProof> {
    return this.authProvider!.createLink(did, accountId)
  }

  async accounts(): Promise<DIDLinksList> {
    return await this.RPCClient!.request('3id_accounts')
  }

  async createAccount(): Promise<boolean> {
    if (!this.authProvider) throw new Error('setAuthProvder required')
    const params = {
      accountId: this.accountId,
    }

    return this.RPCClient!.request('3id_createAccount', params)
  }

  // support priv links in future, auth link, link auth
  async addAuthAndLink(baseDid: string): Promise<boolean> {
    if (!this.authProvider) throw new Error('setAuthProvder required')
    const params = {
      baseDid,
      accountId: this.accountId,
    }

    return this.RPCClient!.request('3id_addAuthAndLink', params)
  }

  /**
   *  Returns a DID provider, which can send and receive messages from iframe
   *
   * @return    {DIDProviderProxy}     A DID provider
   */
  getDidProvider(): DIDProviderProxy {
    if (!this.authProvider) throw new Error('setAuthProvder required')
    return new DIDProviderProxy(this.RPCProvider!, this.authProvider.accountId)
  }
}

export default ThreeIdConnect
