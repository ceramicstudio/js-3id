import type { AuthProvider, LinkProof } from '@ceramicnetwork/blockchain-utils-linking'
import { createClient, createServer } from '@ceramicnetwork/rpc-window'
import type { ServerPayload } from '@ceramicnetwork/rpc-window'
import { AccountId } from 'caip'
import type { RPCClient } from 'rpc-utils'
import type { Observable } from 'rxjs'

let NAMESPACE = '3id-connect-authprovider'

typeof process !== 'undefined' && (NAMESPACE = process.env.NAMESPACE || '3id-connect-authprovider')

export type AuthProviderMethods = {
  accountId: { result: string }
  authenticate: {
    params: { message: string }
    result: string
  }
  createLink: {
    params: { did: string }
    result: LinkProof
  }
}

export class AuthProviderClient<NS extends string> implements AuthProvider {
  client: RPCClient<AuthProviderMethods>
  readonly isAuthProvider = true

  constructor(target: Window = window.parent, namespace = NAMESPACE) {
    this.client = createClient<AuthProviderMethods, NS>(namespace as NS, target)
  }

  async accountId(): Promise<AccountId> {
    const response = await this.client.request('accountId')
    return new AccountId(response)
  }

  async authenticate(message: string): Promise<string> {
    return this.client.request('authenticate', { message })
  }

  async createLink(did: string): Promise<LinkProof> {
    return this.client.request('createLink', { did })
  }

  withAddress(): AuthProvider {
    throw new Error('not implemented')
  }
}

export function createAuthProviderServer<NS extends string>(
  authProvider: AuthProvider,
  namespace = NAMESPACE
): Observable<ServerPayload<AuthProviderMethods, NS>> {
  return createServer<AuthProviderMethods, NS>(namespace as NS, {
    accountId: async () => {
      return (await authProvider.accountId()).toString()
    },
    authenticate: async (_event, { message }) => {
      return await authProvider.authenticate(message)
    },
    createLink: async (_event, { did }) => {
      return await authProvider.createLink(did)
    },
  })
}
