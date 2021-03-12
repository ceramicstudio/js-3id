
import type { AuthProvider, LinkProof } from '@ceramicnetwork/blockchain-utils-linking'
import { RPCClient } from 'rpc-utils'
import { serveCrossOrigin } from '@ceramicnetwork/rpc-postmessage'
import {  createClient } from '@ceramicnetwork/rpc-transport'
import { PostMessageTransport, PostMessageTarget } from '@ceramicnetwork/transport-postmessage'
import { AccountID } from 'caip'

type AuthProviderMethods = {
  accountId: { result: string },
  authenticate: {
    params: { message: string},
    result: string
  },
  createLink: {
    params: { did: string},
    result: LinkProof
  }
}

export class AuthProviderClient implements AuthProvider {

  client: RPCClient
  readonly isAuthProvider = true;

  constructor(target:PostMessageTarget) {
    target = target || window.parent
    const transport = new PostMessageTransport<AuthProviderMethods>(window, target, {
      postMessageArguments: [window.origin], 
    })
    //TODO Cant resolve these types???
    this.client = createClient<AuthProviderMethods>(transport)
  }

  async accountId() {
    const response:string = await this.client.request('accountId')
    return new AccountID(response)
  }

  async authenticate(message: string): Promise<string> {
    return this.client.request('authenticate', { message })
  }

  async createLink(did: string): Promise<LinkProof> {
    return this.client.request('createLink', {did}) as Promise<LinkProof>
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
      authenticate: authProvider.authenticate,
      createLink: authProvider.createLink
    }
  })
  return server
}
  