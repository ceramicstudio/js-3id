import type { AuthProvider, LinkProof } from '@ceramicnetwork/blockchain-utils-linking'
import { RPCClient } from 'rpc-utils'
import type { RPCRequest, RPCResponse } from 'rpc-utils'
import { createCrossOriginClient, createCrossOriginServer } from '@ceramicnetwork/rpc-postmessage'
import type { Wrapped } from '@ceramicnetwork/transport-subject'
import { createPostMessageTransport } from '@ceramicnetwork/transport-postmessage'
import type { PostMessageTarget } from '@ceramicnetwork/transport-postmessage'
import { AccountID } from 'caip'

const NAMESPACE = '3id-connect-authprovider' as const

type AuthProviderMethods = {
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
type Request = Wrapped<RPCRequest<AuthProviderMethods, keyof AuthProviderMethods>, typeof NAMESPACE>
type Response = Wrapped<
  RPCResponse<AuthProviderMethods, keyof AuthProviderMethods>,
  typeof NAMESPACE
>

export class AuthProviderClient implements AuthProvider {
  client: RPCClient<AuthProviderMethods>
  readonly isAuthProvider = true

  constructor(target: PostMessageTarget) {
    const transport = createPostMessageTransport<Response, Request>(
      window,
      target ?? window.parent,
      { postMessageArguments: ['*'] }
    )
    this.client = createCrossOriginClient<AuthProviderMethods, typeof NAMESPACE>(
      transport,
      NAMESPACE,
      { onInvalidInput: () => {} } // Silence warnings of invalid messages
    )
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

export const AuthProviderServer = (authProvider: AuthProvider) => {
  const server = createCrossOriginServer<AuthProviderMethods>({
    namespace: NAMESPACE,
    target: window,
    methods: {
      accountId: async () => {
        return (await authProvider.accountId()).toString()
      },
      authenticate: async (_event, { message }) => {
        return await authProvider.authenticate(message)
      },
      createLink: async (_event, { did }) => {
        return await authProvider.createLink(did)
      },
    },
  })
  return server.subscribe({
    error(msg) {
      console.error('authProvider server error', msg)
    },
  })
}
