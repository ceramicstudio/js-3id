import { createLink, authenticate } from '3id-blockchain-utils'
import AbstractAuthProvider from './abstractAuthProvider'
import { AccountID } from "caip"

const chainId = "eip155:1"

/**
 *  AuthProvider which can be used for ethreum providers with standard interface
 */
class EthereumAuthProvider extends AbstractAuthProvider {
  constructor(ethProvider, address) {
    super()
    this.network = 'ethereum'
    this.provider = ethProvider
    this.address = address
    this.accountId = this._toAccoundId(address)
  }

  _toAccoundId (address) {
    return new AccountID({ address, chainId }).toString()
  }

  async authenticate(message, address) {
    const accountId = address ? this._toAccoundId(address) : this.accountId
    return authenticate(message, accountId, this.provider)
  }

  async createLink(did, address) {
    const accountId = address ? this._toAccoundId(address) : this.accountId
    return createLink(did, accountId, this.provider, { type: 'ethereum-eoa' })
  }
}

export default EthereumAuthProvider
