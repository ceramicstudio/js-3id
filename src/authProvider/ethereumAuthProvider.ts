import { createLink, authenticate } from '3id-blockchain-utils'
import type { LinkProof } from '3id-blockchain-utils'
import { AccountID } from 'caip'

import AbstractAuthProvider from './abstractAuthProvider'
import { assert } from '../errors'
import type { EthereumProvider } from '../types'

// TODO get network from provider
const chainId = 'eip155:1'

/**
 *  AuthProvider which can be used for ethreum providers with standard interface
 */
class EthereumAuthProvider extends AbstractAuthProvider {
  accountId: string
  address: string
  provider: EthereumProvider

  constructor(ethProvider: EthereumProvider, address: unknown) {
    assert.isDefined(ethProvider, 'Missing Ethereum provider')
    assert.isString(address, 'Address must be a string')
    super('ethereum')
    this.provider = ethProvider
    this.address = address
    this.accountId = this._toAccoundId(address)
  }

  _toAccoundId(address: string): string {
    return new AccountID({ address, chainId }).toString()
  }

  async authenticate(message: string, address?: string): Promise<string> {
    assert.isString(message, 'Message must be a string')
    const accountId = address ? this._toAccoundId(address) : this.accountId
    // @ts-ignore wrong definition in 3id-blockchain-utils?
    return await authenticate(message, accountId, this.provider)
  }

  async createLink(did: string, address?: string): Promise<LinkProof> {
    assert.isString(did, 'DID must be a string')
    const accountId = address ? this._toAccoundId(address) : this.accountId
    // @ts-ignore wrong definition in 3id-blockchain-utils?
    return createLink(did, accountId, this.provider, { type: 'ethereum-eoa' })
  }
}

export default EthereumAuthProvider
