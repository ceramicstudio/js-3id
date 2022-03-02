/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import {
  createConnectIframe,
  createDisplayConnectServerRPC,
  createDisplayManageServerRPC,
} from '@3id/connect-display'
import { createAuthProviderServer } from '@3id/window-auth-provider'
import type { AuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import type { DIDProvider } from 'dids'
import type { Subscription } from 'rxjs'
import { isValidNetwork, iframeByNetwork, iframeManageUrl, Network, iframeUrl } from '@3id/common'
import { DidProviderWindowProxy } from './DidProviderWindowProxy.js'

const DEFAULT_NETWORK = 'testnet-clay'

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

    const iframeDomain = isValidNetwork(network || '')
      ? iframeByNetwork(network as Network)
      : network || iframeByNetwork(DEFAULT_NETWORK)
    this.iframe = createConnectIframe(iframeUrl(iframeDomain))
    this.manageUrl = iframeManageUrl(iframeDomain)

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

    // TODO: this should only be set if there is a provider injected, also need to stop current subscription
    this._authProviderSubscription = createAuthProviderServer(provider).subscribe()
    createDisplayConnectServerRPC(this.iframe).subscribe()
    createDisplayManageServerRPC(this.manageUrl).subscribe()
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
   * @return    {DIDProvider}     A DID provider
   */
  getDidProvider(): DIDProvider {
    if (!this.authProvider) throw new Error('setAuthProvider required')
    if (!this.iframe.contentWindow) throw new Error('3id connect iframe service not found')
    return new DidProviderWindowProxy(this.iframe.contentWindow)
  }
}
