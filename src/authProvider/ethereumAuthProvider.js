import { createLink, authenticate } from '3id-blockchain-utils/src/index' //TODO
import AbstractAuthProvider from './abstractAuthProvider'

/**
 *  AuthProvider which can be used for ethreum providers with standard interface
 */
class EthereumAuthProvider extends AbstractAuthProvider {
  constructor(ethProvider) {
    super()
    this.network = 'ethereum'
    this.provider = ethProvider
  }

  async authenticate(message, accountId) {
    return authenticate.ethereum(message, accountId, this.provider)
  }

  async createLink(did, accountId) {
    return createLink(did, accountId, this.provider, { type: 'ethereum-eoa' })
  }
}

export default EthereumAuthProvider
