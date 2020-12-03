/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import type { RPCParams, RPCRequest, RPCResponse } from 'rpc-utils'

import type { DIDProvider } from './types'

/**
 *  A DID provider proxy, DID provider interface that acts as rpc client, to
 *  relay request to iframe (rpc server)
 */
class DidProviderProxy implements DIDProvider {
  accountId: string
  provider: DIDProvider

  constructor(provider: DIDProvider, accountId: string) {
    this.provider = provider
    this.accountId = accountId
  }

  get isDidProvider(): boolean {
    return true
  }

  async send<P extends RPCParams | undefined = undefined, R = unknown, E = undefined>(
    msg: RPCRequest<string, P>,
    origin?: string | null
  ): Promise<RPCResponse<R, E> | null> {
    msg.params = Object.assign({}, msg.params, { accountId: this.accountId })
    return await this.provider.send(msg, origin)
  }
}

export default DidProviderProxy
