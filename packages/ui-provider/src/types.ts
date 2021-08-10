import type { 
  RPCClient,
  RPCConnection, 
  RPCRequest, 
  RPCResponse, 
  RPCErrorObject,
  HandlerMethods
} from 'rpc-utils'

export type MigrationParams = {
  legacyDid: string
}

export type MigrationRes = {
  migration: boolean
}

export type MigrationSkipRes  = {
  skip: boolean
}

export type MigrationFailRes  = {
  createNew: boolean
}

export type AccountRes = {
  createNew: boolean
}

export type AuthParams = {
	origin: string
  paths: Array<string> 
  did: string
}

export type AuthRes = {
  allow: boolean
}

export type UIProviderMethods = {
  prompt_migration: { params: MigrationParams; result: MigrationRes }
  prompt_migration_skip: { params: {}; result: MigrationSkipRes }
  prompt_migration_fail: { params: {}; result: MigrationFailRes }
  prompt_account: { params: {}; result: AccountRes }
  prompt_authenticate: { params: AuthParams; result: AuthRes }
  inform_error: { params: RPCErrorObject, result: null }
}

export type UIMethodName = keyof UIProviderMethods
export type UIRequest<K extends UIMethodName = UIMethodName> = RPCRequest<UIProviderMethods, K>
export type UIResponse<K extends UIMethodName = UIMethodName> = RPCResponse<
  UIProviderMethods,
  K
>
export type UIProviderInterface = RPCConnection<UIProviderMethods>
export type UIProviderClient = RPCClient<UIProviderMethods>
export type UIProviderOrClient = UIProviderInterface | UIProviderClient
export type UIProviderHandlers =  HandlerMethods<{}, UIProviderMethods>


