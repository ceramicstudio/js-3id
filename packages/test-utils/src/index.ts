import { EventEmitter } from 'events'
import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import type { AuthProvider, LinkProof } from '@ceramicnetwork/blockchain-utils-linking'
import { entropyToMnemonic } from '@ethersproject/hdnode'
import { Wallet as EthereumWallet } from '@ethersproject/wallet'
import { AccountId } from 'caip'
import { fromString, toString } from 'uint8arrays'

export class EthereumProvider extends EventEmitter {
  wallet: EthereumWallet

  constructor(wallet: EthereumWallet) {
    super()
    this.wallet = wallet
  }

  send(
    request: { method: string; params: Array<any> },
    callback: (err: Error | null | undefined, res?: any) => void
  ): void {
    if (request.method === 'eth_chainId') {
      callback(null, { result: '1' })
    } else if (request.method === 'personal_sign') {
      let message = request.params[0] as string
      if (message.startsWith('0x')) {
        message = toString(fromString(message.slice(2), 'base16'), 'utf8')
      }
      callback(null, { result: this.wallet.signMessage(message) })
    } else {
      callback(new Error(`Unsupported method: ${request.method}`))
    }
  }
}

export class EthereumMigrationMockAuthProvider implements AuthProvider {
  get isAuthProvider(): true {
    return true
  }

  accountId(): Promise<AccountId> {
    return Promise.resolve(
      new AccountId({
        address: '0x5314846209d781caad6258b0de7c13acb99ef692',
        chainId: `eip155:1`,
      })
    )
  }

  authenticate(message: string): Promise<string> {
    if (message === 'Allow this account to control your identity') {
      return Promise.resolve('0xe80f049f93bd9ad99b24ba7cea21271eea92e493bf01e0633821c29760f69381')
    } else if (message === 'This app wants to view and update your 3Box profile.') {
      return Promise.resolve('0xda87c0f5ff9d1237f0cf7eeb0d6507e8144038d56ccac1c7479df7bf95f20015')
    } else {
      throw new Error('Mock message signature not supported')
    }
  }

  createLink(_did: string): Promise<LinkProof> {
    throw new Error('createLink not required in migration')
  }

  withAddress(_address: string): AuthProvider {
    throw new Error('withAddress not required in migration')
  }
}

export function createEthereumAuthProvider(mnemonic?: string): Promise<EthereumAuthProvider> {
  const wallet = mnemonic ? EthereumWallet.fromMnemonic(mnemonic) : EthereumWallet.createRandom()
  const provider = new EthereumProvider(wallet)
  return Promise.resolve(new EthereumAuthProvider(provider, wallet.address))
}

export const createAuthProvider = async (id: number): Promise<AuthProvider> => {
  const idStr = id.toString()
  const entropy = `0x${'0'.repeat(64 - idStr.length)}${idStr}`
  const mn = entropyToMnemonic(entropy)
  return createEthereumAuthProvider(mn)
}
