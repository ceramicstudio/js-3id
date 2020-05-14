import ethUtils from './../../../js-3id-blockchain-utils/src/blockchains/ethereum' //TODO
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
    return ethUtils.authenticate(message, accountId, this.provider)
  }

  async createLink(did, accountId) {
    return ethUtils.createLink(did, accountId, 'ethereum-eoa', this.provider)
  }
}

export default EthereumAuthProvider
