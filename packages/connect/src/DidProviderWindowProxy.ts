/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import type { DIDMethodName, DIDProvider, DIDProviderMethods } from 'dids'
import { RPCClient, RPCResponse, RPCRequest } from 'rpc-utils'
import { createClient } from '@ceramicnetwork/rpc-window'
import { DIDRPCNameSpace } from '@3id/common'

export class DidProviderWindowProxy implements DIDProvider {
  _client: RPCClient<DIDProviderMethods>

  constructor(target: Window, namespace = DIDRPCNameSpace) {
    this._client = createClient<DIDProviderMethods>(namespace, target)
  }

  get isDidProvider(): boolean {
    return true
  }

  async send<Name extends DIDMethodName>(
    msg: RPCRequest<DIDProviderMethods, Name>
  ): Promise<RPCResponse<DIDProviderMethods, Name> | null> {
    return this._client.connection.send(msg)
  }
}
