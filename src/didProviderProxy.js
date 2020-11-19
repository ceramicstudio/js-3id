import { caller } from 'postmsg-rpc'

/**
 *  A DID provider proxy, DID provider interface that acts as rpc client, to
 *  relay request to iframe (rpc server)
 */
class DidProviderProxy {
  constructor (provider, accountId) {
    this.provider = provider
    this.accountId = accountId
  }

  get isDidProvider() {
    return true
  }

  async send (msg, origin) {
    msg.params = Object.assign({}, msg.params, { accountId: this.accountId })
    return this.provider.send(msg)
  }
}

export default DidProviderProxy
