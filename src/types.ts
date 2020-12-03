import type { RPCParams, RPCRequest, RPCResponse } from 'rpc-utils'

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

export interface DIDProvider<M = string> {
  send<P extends RPCParams | undefined = undefined, R = unknown, E = undefined>(
    msg: RPCRequest<M, P>,
    origin?: string | null
  ): Promise<RPCResponse<R, E> | null>
}

export type UserAuthenticateRequest = {
  type: 'authenticate'
  paths: Array<string>
  origin?: string | null
}
export type UserAccountRequest = {
  type: 'account'
  accounts: Array<string>
}
export type UserCreateRequest = {
  type: 'create'
}
export type UserLinkRequest = {
  type: 'link'
  baseDid: string
  accountId: string
}
export type UserRequest =
  | UserAuthenticateRequest
  | UserAccountRequest
  | UserCreateRequest
  | UserLinkRequest
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
