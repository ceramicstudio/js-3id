import type { JWE } from 'did-jwt'
import type { RPCConnection, RPCRequest, RPCResponse } from 'rpc-utils'

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

// Eventually these types should be exported by 3ID DID Provider

type CreateJWSParams = {
  payload: Record<string, any>
  protected?: Record<string, any>
  revocable?: boolean
  did: string
}

type DecryptJWEParams = {
  jwe: JWE
  did?: string
}

type AuthParams = {
  paths: Array<string>
  nonce: string
  aud?: string
}

type JWSSignature = {
  protected: string
  signature: string
}

type GeneralJWS = {
  payload: string
  signatures: Array<JWSSignature>
}

export type DIDProviderMethods = {
  did_authenticate: { params: AuthParams; result: GeneralJWS }
  did_createJWS: { params: CreateJWSParams; result: { jws: GeneralJWS } }
  did_decryptJWE: { params: DecryptJWEParams; result: { cleartext: string } }
}
export type DIDMethodName = keyof DIDProviderMethods

export type DIDRequest<K extends DIDMethodName = DIDMethodName> = RPCRequest<DIDProviderMethods, K>
export type DIDResponse<K extends DIDMethodName = DIDMethodName> = RPCResponse<
  DIDProviderMethods,
  K
>

export type DIDProvider = RPCConnection<DIDProviderMethods, [string | null | undefined]>
