import type { DIDMethodName, DIDRequest, DIDResponse, DIDProvider } from '@3id/common'

/**
 *  A DID provider proxy, DID provider interface that acts as rpc client, to
 *  relay request to iframe (rpc server)
 */
export class DidProviderProxy implements DIDProvider {
  accountId: string
  provider: DIDProvider

  constructor(provider: DIDProvider, accountId: string) {
    this.provider = provider
    this.accountId = accountId
  }

  get isDidProvider(): boolean {
    return true
  }

  async send<K extends DIDMethodName>(
    msg: DIDRequest<K>,
    origin?: string | null
  ): Promise<DIDResponse<K> | null> {
    msg.params = Object.assign({}, msg.params, { accountId: this.accountId })
    return await this.provider.send(msg, origin)
  }
}
