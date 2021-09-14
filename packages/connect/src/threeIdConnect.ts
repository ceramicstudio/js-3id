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

export type NetworkConfig = {
  connect_iframe: string
  manage_iframe: string
}
export type NetworkList = Record<string, NetworkConfig>

// Base iframe urls by network
const BASE_DEV_URL = 'https://app-dev.3idconnect.org'
const BASE_CLAY_URL = 'https://app-clay.3idconnect.org'
const BASE_MAIN_URL = 'https://app.3idconnect.org'
const BASE_LOCAL_URL = `http://localhost:30001`
const DEFAULT_MANAGE_PATH = `/management/index.html`

let CONNECT_IFRAME_URL = BASE_CLAY_URL;
let CONNECT_MANAGE_URL = `${BASE_CLAY_URL}/management/index.html`;

typeof process !== 'undefined' && (CONNECT_IFRAME_URL = process.env.CONNECT_IFRAME_URL || BASE_CLAY_URL);
typeof process !== 'undefined' && (CONNECT_MANAGE_URL = process.env.CONNECT_MANAGE_URL || `${BASE_CLAY_URL}/management/index.html`);

const networkConfig = (base: string): NetworkConfig => {
  return {
    connect_iframe: base,
    manage_iframe: `${base}${DEFAULT_MANAGE_PATH}`
  }
}
// Configuration for each network
const networks: NetworkList = {
  'dev-unstable': networkConfig(BASE_DEV_URL),
  'testnet-clay': networkConfig(BASE_CLAY_URL),
  'mainnet': networkConfig(BASE_MAIN_URL),
  'local': networkConfig(BASE_LOCAL_URL)
}

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
   * @param     {String}    network     network name, or iframe url, testnet-clay, dev-unstable, local and mainnet are supported
   * @param     {String}    iframeUrl   manage iframe url
   */

  constructor(network?: string, manageUrl?: string) {
    assertBrowser()
    let iframeUrl

    if (network && Object.keys(networks).includes(network)) {
      iframeUrl = networks[network].connect_iframe
      manageUrl = networks[network].manage_iframe
    } else {
      iframeUrl = network
    }

    this.iframe = createConnectIframe(iframeUrl || CONNECT_IFRAME_URL)
    this.manageUrl = manageUrl || CONNECT_MANAGE_URL

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
