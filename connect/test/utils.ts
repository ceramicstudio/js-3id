import { Wallet as EthereumWallet } from '@ethersproject/wallet'
import { fromString, toString } from 'uint8arrays'
import { AccountID } from 'caip'
import { EthereumAuthProvider, AuthProvider } from '../src/index'
import { EventEmitter } from 'events'

export class EthereumProvider extends EventEmitter {
  wallet: EthereumWallet

  constructor(wallet: EthereumWallet) {
    super()
    this.wallet = wallet
  }

  send(
    request: { method: string; params: Array<any> },
    callback: (err: Error | null | undefined, res?: any) => void
  ) {
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

// TODO moved shared test utils, after repo reorg
export class EthereumMigrationMockAuthProvider implements AuthProvider {
  async accountId() {
    return new AccountID({
      address: '0x5314846209d781caad6258b0de7c13acb99ef692',
      chainId: `eip155:1`,
    })
  }

  async authenticate(message: string): Promise<string> {
    if (message === 'Add this account as a Ceramic authentication method') {
      return '0xe80f049f93bd9ad99b24ba7cea21271eea92e493bf01e0633821c29760f69381'
    } else if (message === 'This app wants to view and update your 3Box profile.') {
      return '0xda87c0f5ff9d1237f0cf7eeb0d6507e8144038d56ccac1c7479df7bf95f20015'
    } else {
      throw new Error('Mock message signature not supported')
    }
  }

  async createLink(did: string): Promise<LinkProof> {
    throw new Error('CreateLink not required in migration')
  }
}

// TODO moved shared test utils, after repo reorg
export function createEthereumAuthProvider(mnemonic?: string): Promise<EthereumAuthProvider> {
  const wallet = mnemonic ? EthereumWallet.fromMnemonic(mnemonic) : EthereumWallet.createRandom()
  const provider = new EthereumProvider(wallet)
  return Promise.resolve(new EthereumAuthProvider(provider, wallet.address))
}