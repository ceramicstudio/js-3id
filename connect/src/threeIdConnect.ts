import type { AuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import { caller } from 'postmsg-rpc'
import { RPCClient } from 'rpc-utils'
import type { RPCConnection, RPCRequest } from 'rpc-utils'
import { AuthProviderServer } from './authProviderRelay'
import { DisplayServerRPC, createIframe } from './iframeDisplay'

import DIDProviderProxy from './didProviderProxy'

const CONNECT_IFRAME_URL = process.env.CONNECT_IFRAME_URL || 'https://app.3idconnect.org'

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

const assertBrowser = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('ThreeIdConnect not supported in this enviroment')
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

  // TODO
  rpcServer: any
  rpcDisplayServer: any

  _connected = false

  /**
   *  Creates ThreeIdConnect. Create and loads iframe. Should be instantiated
   *  on page load.
   *
   * @param     {String}    iframeUrl   iframe url, defaults to 3id-connect iframe service
   */
  constructor(iframeUrl?: string) {
    assertBrowser()

    this.iframe = createIframe(iframeUrl || CONNECT_IFRAME_URL)

    this.iframeLoadedPromise = new Promise((resolve) => {
      this.iframe.onload = () => {
        resolve()
      }
    })

    document.body.appendChild(this.iframe)
  }

  async connect(provider: AuthProvider): Promise<void> {
    if (provider) {
      await this.setAuthProvider(provider)
    }
    await this.iframeLoadedPromise
    this.postMessage = this.iframe.contentWindow!.postMessage.bind(this.iframe.contentWindow)

    this.rpcServer = AuthProviderServer(provider)
    this.rpcDisplayServer = DisplayServerRPC(this.iframe)

    // TODO also change this to use transports
    this.RPCProvider = createRPCProvider(this.postMessage)
    this.RPCClient = new RPCClient(this.RPCProvider)
    this._connected = true
  }

  async setAuthProvider(authProvider: AuthProvider): Promise<void> {
    this.authProvider = authProvider
    this.accountId = (await this.authProvider.accountId()).toString()
  }

  get connected(): boolean {
    return this._connected
  }

  /**
   *  Returns a DID provider, which can send and receive messages from iframe
   *
   * @return    {DIDProviderProxy}     A DID provider
   */
  getDidProvider(): DIDProviderProxy {
    if (!this.authProvider) throw new Error('setAuthProvider required')
    return new DIDProviderProxy(this.RPCProvider!, this.accountId!)
  }
}

export default ThreeIdConnect
