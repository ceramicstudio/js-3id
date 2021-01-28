import { EventEmitter } from 'events'
import { Wallet } from '@ethersproject/wallet'
import { fromString, toString } from 'uint8arrays'

import { EthereumAuthProvider, ThreeIdConnect } from '../../src'

class EthereumProvider extends EventEmitter {
  wallet: Wallet

  constructor(wallet: Wallet) {
    super()
    this.wallet = wallet
  }

  send(
    request: { method: string; params: Array<any> },
    callback: (err: Error | null | undefined, res?: any) => void
  ) {
    if (request.method !== 'personal_sign') {
      callback(new Error('only supports personal_sign'))
    } else {
      let message = request.params[0] as string
      if (message.startsWith('0x')) {
        message = toString(fromString(message.slice(2), 'base16'), 'utf8')
      }
      callback(null, { result: this.wallet.signMessage(message) })
    }
  }
}

const threeIdConnect = new ThreeIdConnect('iframe.html')
window.threeIdConnect = threeIdConnect

function createWallet(mnemonic?: string): Wallet {
  return mnemonic ? Wallet.fromMnemonic(mnemonic) : Wallet.createRandom()
}
window.createWallet = createWallet

function createAuthProvider(wallet: Wallet): EthereumAuthProvider {
  const provider = new EthereumProvider(wallet)
  return new EthereumAuthProvider(provider, provider.wallet.address)
}
window.createAuthProvider = createAuthProvider

const connect = async () => {
  const wallet = createWallet()
  const provider = new EthereumProvider(wallet)
  const authProvider = new EthereumAuthProvider(provider, wallet.address)
  await threeIdConnect.connect(authProvider)
  await threeIdConnect.createAccount()
}

document.getElementById('connect').addEventListener('click', connect)
