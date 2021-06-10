export interface ProviderConnectInfo {
  readonly chainId: string
}

export interface ProviderMessage {
  readonly type: string
  readonly data: unknown
}

export interface ProviderRpcError extends Error {
  message: string
  code: number
  data?: unknown
}

export interface RequestArguments {
  readonly method: string
  readonly params?: ReadonlyArray<unknown> | Record<string, unknown>
}

export interface EthereumProvider extends NodeJS.EventEmitter {
  on(event: 'connect', listener: (connectInfo: ProviderConnectInfo) => void): this
  on(event: 'disconnect', listener: (error: ProviderRpcError) => void): this
  on(event: 'chainChanged', listener: (chainId: string) => void): this
  on(event: 'accountsChanged', listener: (accounts: Array<string>) => void): this
  on(event: 'message', listener: (message: ProviderMessage) => void): this
  request<T = unknown>(args: RequestArguments): Promise<T>
}

export interface EOSIOProvider {
  getKeys(): Promise<Array<string>>
  getAccountName(): Promise<string>
  getChainId(): Promise<string>
  signArbitrary(publicKey: string, data: string): Promise<string>
}

