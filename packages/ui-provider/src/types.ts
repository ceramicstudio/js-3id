import type {
  RPCClient,
  RPCConnection,
  RPCRequest,
  RPCResponse,
  RPCErrorObject,
  HandlerMethods,
} from 'rpc-utils'

export type MigrationParams = {
  legacyDid: string
  caip10: string
}

export type MigrationFailParams = {
  caip10: string
}

export type AccountParams = {
  caip10: string
}

export type MigrationRes = {
  migration: boolean
}

export type MigrationSkipRes = {
  skip: boolean
}

export type MigrationFailRes = {
  createNew: boolean
}

export type AccountRes = {
  createNew: boolean
}

export type AuthParams = {
  origin: string
  paths: Array<string>
  did?: string
}

export type AuthRes = {
  allow: boolean
}

export type UIProviderMethods = {
  prompt_migration: { params: MigrationParams; result: MigrationRes }
  prompt_migration_skip: { params: MigrationFailParams; result: MigrationSkipRes }
  prompt_migration_fail: { params: MigrationFailParams; result: MigrationFailRes }
  prompt_account: { params: AccountParams; result: AccountRes }
  prompt_authenticate: { params: AuthParams; result: AuthRes }
  inform_error: { params: RPCErrorObject; result: null }
  inform_close: { params: Record<string, never>; result: null }
}

export type UIMethodName = keyof UIProviderMethods
export type UIRequest<K extends UIMethodName = UIMethodName> = RPCRequest<UIProviderMethods, K>
export type UIResponse<K extends UIMethodName = UIMethodName> = RPCResponse<UIProviderMethods, K>
export type UIProviderInterface = RPCConnection<UIProviderMethods>
export type UIProviderClient = RPCClient<UIProviderMethods>
export type UIProviderOrClient = UIProviderInterface | UIProviderClient
export type UIProviderHandlers = HandlerMethods<Record<string, never>, UIProviderMethods>
