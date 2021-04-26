import type { DIDMethodName, DIDRequest, DIDResponse, DIDProvider, DIDProviderMethods } from 'dids'
import type { SendRequestFunc } from 'rpc-utils'

type DIDProviderWithOrigin = DIDProvider & {
  send: SendRequestFunc<DIDProviderMethods, [string | null | undefined]>
}

/**
 *  A DID provider proxy, DID provider interface that acts as rpc client, to
 *  relay request to iframe (rpc server)
 */
export class DidProviderProxy implements DIDProviderWithOrigin {
  accountId: string
  provider: DIDProviderWithOrigin

  constructor(provider: DIDProviderWithOrigin, accountId: string) {
    this.provider = provider
    this.accountId = accountId
  }

  get isDidProvider(): boolean {
    return true
  }

  async send<Name extends DIDMethodName>(
    msg: DIDRequest<Name>,
    origin?: string | null
  ): Promise<DIDResponse<Name> | null> {
    msg.params = Object.assign({}, msg.params, { accountId: this.accountId })
    return await this.provider.send(msg, origin)
  }
}
