import { EventEmitter } from 'events'
import ThreeIDResolver from '@ceramicnetwork/3id-did-resolver'
import Ceramic from '@ceramicnetwork/http-client'
import { Wallet } from '@ethersproject/wallet'
import { DID } from 'dids'
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

const ceramic = new Ceramic('http://localhost:7777')
window.ceramic = ceramic

const threeIdConnect = new ThreeIdConnect('iframe.html')
window.threeIdConnect = threeIdConnect

function createWallet(mnemonic?: string): Wallet {
  return mnemonic ? Wallet.fromMnemonic(mnemonic) : Wallet.createRandom()
}
window.createWallet = createWallet

function createAuthProvider(wallet: Wallet): EthereumAuthProvider {
  const provider = new EthereumProvider(wallet)
  return new EthereumAuthProvider(provider, wallet.address)
}
window.createAuthProvider = createAuthProvider

function createDID(provider): DID {
  return new DID({ provider, resolver: ThreeIDResolver.getResolver(ceramic) })
}
window.createDID = createDID

async function authenticateDID(mnemonic?: string): Promise<DID> {
  const wallet = createWallet(mnemonic)
  const authProvider = createAuthProvider(wallet)
  await threeIdConnect.connect(authProvider)
  const did = createDID(threeIdConnect.getDidProvider())
  await did.authenticate()
  return did
}
window.authenticateDID = authenticateDID

async function connect() {
  const did = await authenticateDID()
  console.log('DID:', did.id)
}
document.getElementById('connect').addEventListener('click', connect)
