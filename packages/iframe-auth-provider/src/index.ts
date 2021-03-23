import { createClient, createServer } from '@3id/iframe-rpc'
import type { AuthProvider, LinkProof } from '@ceramicnetwork/blockchain-utils-linking'
import type { PostMessageTarget } from '@ceramicnetwork/transport-postmessage'
import { AccountID } from 'caip'
import type { RPCClient } from 'rpc-utils'

const NAMESPACE = process.env.NAMESPACE || '3id-connect-authprovider' as const

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

export class AuthProviderClient implements AuthProvider {
  client: RPCClient<AuthProviderMethods>
  readonly isAuthProvider = true

  constructor(target?: PostMessageTarget) {
    this.client = createClient<AuthProviderMethods>(NAMESPACE, target)
  }

  async accountId() {
    const response = await this.client.request('accountId')
    return new AccountID(response)
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

export function createAuthProviderServer(authProvider: AuthProvider) {
  return createServer<AuthProviderMethods>(NAMESPACE, {
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
