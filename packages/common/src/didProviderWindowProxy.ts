import type { DIDMethodName, DIDProvider, DIDProviderMethods } from 'dids'
import { RPCClient, RPCResponse, RPCRequest } from 'rpc-utils'
import { createClient, createServer } from '@ceramicnetwork/rpc-window'
import type { ServerPayload } from '@ceramicnetwork/rpc-window'
import type { Observable } from 'rxjs'
import type {
  AuthParams,
  CreateJWSParams,
  DecryptJWEParams,
} from 'dids'

export const DIDRPCNameSpace = '3id-connect-did-provider'

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

export function createDIDProviderServer<NS extends string>(
  didProvider: DIDProvider,
  namespace = DIDRPCNameSpace
): Observable<ServerPayload<DIDProviderMethods, NS>> {
  const client = new RPCClient<DIDProviderMethods>(didProvider)
  return createServer<DIDProviderMethods, NS>(namespace as NS, {
    did_authenticate: async (_event, params: AuthParams) => {
      return client.request('did_authenticate', params)
    },
    did_createJWS: async (_event, params: CreateJWSParams & { did: string }) => {
      return client.request('did_createJWS', params)
    },
    did_decryptJWE: async (_event, params: DecryptJWEParams) => {
      return client.request('did_decryptJWE', params)
    }
  })
}