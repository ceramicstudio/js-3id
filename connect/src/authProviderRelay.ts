import type { AuthProvider, LinkProof } from '@ceramicnetwork/blockchain-utils-linking'
import { RPCClient } from 'rpc-utils'
import type { RPCRequest, RPCResponse } from 'rpc-utils'
import { serveCrossOrigin } from '@ceramicnetwork/rpc-postmessage'
import { createClient } from '@ceramicnetwork/rpc-transport'
import { PostMessageTransport } from '@ceramicnetwork/transport-postmessage'
import type { PostMessageTarget } from '@ceramicnetwork/transport-postmessage'
import { AccountID } from 'caip'

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
type Request = RPCRequest<AuthProviderMethods, keyof AuthProviderMethods>
type Response = RPCResponse<AuthProviderMethods, keyof AuthProviderMethods>

export class AuthProviderClient implements AuthProvider {
  client: RPCClient<AuthProviderMethods>
  readonly isAuthProvider = true

  constructor(target: PostMessageTarget) {
    target = target || window.parent
    const transport = new PostMessageTransport<Response, Request>(window, target, {
      postMessageArguments: [window.origin],
    })
    this.client = createClient<AuthProviderMethods>(transport)
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
  const server = serveCrossOrigin<AuthProviderMethods>(window, {
    ownOrigin: window.origin,
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
  return server
}
