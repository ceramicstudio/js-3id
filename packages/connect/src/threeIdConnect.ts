import {
  createConnectIframe,
  createDisplayConnectServerRPC,
  createDisplayManageServerRPC,
} from '@3id/connect-display'
import { createAuthProviderServer } from '@3id/window-auth-provider'
import type { AuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import type { DIDProvider } from 'dids'
import { caller } from 'postmsg-rpc'
import { RPCClient } from 'rpc-utils'
import type { RPCConnection } from 'rpc-utils'
import type { Subscription } from 'rxjs'
import { DidProviderProxy } from './didProviderProxy'
import { isValidNetwork, iframeByNetwork, iframeManageUrl, Network } from '@3id/common'

const DEFAULT_NETWORK = 'testnet-clay'

type PostMessage = (
  message: any,
  targetOrigin: string,
  transfer?: Array<Transferable> | undefined
) => void

const createRPCProvider = (postMessage: PostMessage): DIDProvider => {
  const sendRPC = caller<Array<any>, string>('send', { postMessage })
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    send: async (req: any) => JSON.parse(await sendRPC(req)),
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
export class ThreeIdConnect {
  iframe: HTMLIFrameElement
  iframeLoadedPromise: Promise<void>
  postMessage: PostMessage | undefined

  RPCProvider: DIDProvider | undefined
  RPCClient: RPCClient<any> | undefined

  authProvider: AuthProvider | undefined
  accountId: string | undefined
  manageUrl: string

  _authProviderSubscription: Subscription | null = null
  _connected = false

  /**
   *  Creates ThreeIdConnect. Create and loads iframe. Should be instantiated
   *  on page load.
   *
   * @param     {String}    network     network name: testnet-clay, dev-unstable, local and mainnet are supported or or iframe url
   */

  constructor(network?: string) {
    assertBrowser()

    const iframeUrl = isValidNetwork(network || '')
      ? iframeByNetwork(network as Network)
      : network || iframeByNetwork(DEFAULT_NETWORK)
    this.iframe = createConnectIframe(iframeUrl)
    this.manageUrl = iframeManageUrl(iframeUrl)

    this.iframeLoadedPromise = new Promise((resolve) => {
      this.iframe.onload = () => {
        resolve()
      }
    })

    document.body.appendChild(this.iframe)
  }

  async connect(provider: AuthProvider): Promise<void> {
    if (this._authProviderSubscription) {
      this._authProviderSubscription.unsubscribe()
    }
    if (provider) {
      await this.setAuthProvider(provider)
    }
    await this.iframeLoadedPromise
    this.postMessage = this.iframe.contentWindow!.postMessage.bind(this.iframe.contentWindow)

    // TODO: this should only be set if there is a provider injected, also need to stop current subscription
    this._authProviderSubscription = createAuthProviderServer(provider).subscribe()
    createDisplayConnectServerRPC(this.iframe).subscribe()
    createDisplayManageServerRPC(this.manageUrl).subscribe()

    // TODO also change this to use transports
    this.RPCProvider = createRPCProvider(this.postMessage)
    this.RPCClient = new RPCClient(this.RPCProvider as RPCConnection<any>)
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
   * @return    {DidProviderProxy}     A DID provider
   */
  getDidProvider(): DidProviderProxy {
    if (!this.authProvider) throw new Error('setAuthProvider required')
    return new DidProviderProxy(this.RPCProvider as DIDProvider, this.accountId!)
  }
}
