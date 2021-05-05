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

export type UserAuthenticateRequest = {
  type: 'authenticate'
  paths: Array<string>
  origin?: string | null
  did?: string
}
export type UserAccountRequest = {
  type: 'account'
  accounts: Array<string>
}
export type UserMigrationRequest = {
  type: 'migration'
  legacyDid: string
}
export type UserRequest =
  | UserAuthenticateRequest
  | UserAccountRequest
  | UserMigrationRequest
export type UserRequestWithError = UserRequest & { error?: string }

export type UserRequestHandler = (req: UserRequest) => Promise<boolean>

export type UserRequestCancel = (callback?: () => void) => void

export type UserRequestErrorCallback = (
  error: Error,
  message?: string,
  request?: UserRequest
) => void

export type AccountsList = Array<string>
export type DIDLinksList = Record<string, AccountsList>

export type ExcludesBoolean = <T>(x: T | null) => x is T

export type AuthConfig = { authId: string; authSecret: Uint8Array }
export type SeedConfig = { v03ID: string; seed: Uint8Array }
