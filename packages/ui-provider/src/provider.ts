import type {
  UIProviderMethods,
  MigrationParams,
  UIProviderClient,
  MigrationFailParams,
  AccountParams,
  AuthParams,
  UIProviderInterface,
  UIRequest,
  UIResponse,
  UIMethodName,
} from './types'
import { RPCClient, createHandler, RPCErrorObject } from 'rpc-utils'
import type { SendRequestFunc, HandlerMethods } from 'rpc-utils'

type Context = {}

export class UIProvider implements UIProviderInterface {
  _handle: SendRequestFunc<UIProviderMethods>

  constructor(UIMethods: HandlerMethods<Context, UIProviderMethods>) {
    const handler = createHandler<Context, UIProviderMethods>(UIMethods)
    this._handle = async (msg) => await handler({}, msg)
  }

  get isUIProvider(): boolean {
    return true
  }

  async send<Name extends UIMethodName>(msg: UIRequest<Name>): Promise<UIResponse<Name> | null> {
    return await this._handle(msg)
  }
}

export class ThreeIDManagerUI {
  private _client: UIProviderClient

  constructor(provider: UIProviderInterface) {
    this._client = new RPCClient(provider)
  }

  async promptMigration(params: MigrationParams) {
    return this._client.request('prompt_migration', params)
  }

  async promptMigrationSkip(params: MigrationFailParams) {
    return this._client.request('prompt_migration_skip', params)
  }

  async promptMigrationFail(params: MigrationFailParams) {
    return this._client.request('prompt_migration_fail', params)
  }

  async promptAuthenticate(params: AuthParams) {
    return this._client.request('prompt_authenticate', params)
  }

  async promptAccount(params: AccountParams) {
    return this._client.request('prompt_account', params)
  }

  async noftifyError(error: RPCErrorObject) {
    return this._client.notify('inform_error', error)
  }

  async noftifyClose(params = {}) {
    return this._client.notify('inform_close', params)
  }
}
