import { EventEmitter } from 'events'
import ThreeIDResolver from '@ceramicnetwork/3id-did-resolver'
import Ceramic from '@ceramicnetwork/http-client'
import { Wallet } from '@ethersproject/wallet'
import { EOSIOProvider } from '@smontero/eosio-local-provider'
import { DID } from 'dids'
import ecc from 'eosjs-ecc'
import { fromString, toString } from 'uint8arrays'

import { EosioAuthProvider, EthereumAuthProvider, ThreeIdConnect } from '../../src'

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

async function createEosioAuthProvider(seed?: string): Promise<EosioAuthProvider> {
  // const privateKey = seed ? ecc.seedPrivate(seed) : await ecc.unsafeRandomKey()
  // const publicKey = ecc.privateToPublic(privateKey)
  // const keys = { [publicKey]: privateKey }
  // console.log('keys', keys)
  // const account = 'eostestaccount'
  // const provider = new EOSIOProvider({
  //   chainId: '2a02a0053e5a8cf73a56ba0fda11e4d92e0238a4a2aa74fccf46d5a910746840',
  //   account,
  //   keys,
  // })
  const provider = new EOSIOProvider({
    chainId: '2a02a0053e5a8cf73a56ba0fda11e4d92e0238a4a2aa74fccf46d5a910746840',
    account: 'idx3idctest1',
    keys: {
      EOS7f7hdusWKXY1cymDLvUL3m6rTLKmdyPi4e6kquSnmfVxxEwVcC:
        '5JRzDcbMqvTJxjHeP8vZqZbU9PwvaaTsoQhoVTAs3xBVSZaPB9U',
    },
  })
  return new EosioAuthProvider(provider, 'idx3idctest1')
}
window.createEosioAuthProvider = createEosioAuthProvider

function createEthereumAuthProvider(mnemonic?: string): EthereumAuthProvider {
  const wallet = mnemonic ? Wallet.fromMnemonic(mnemonic) : Wallet.createRandom()
  const provider = new EthereumProvider(wallet)
  return new EthereumAuthProvider(provider, wallet.address)
}
window.createEthereumAuthProvider = createEthereumAuthProvider

function createDID(provider): DID {
  return new DID({ provider, resolver: ThreeIDResolver.getResolver(ceramic) })
}
window.createDID = createDID

async function authenticateDID(authProvider): Promise<DID> {
  await threeIdConnect.connect(authProvider)
  const did = createDID(threeIdConnect.getDidProvider())
  await did.authenticate()
  return did
}
window.authenticateDID = authenticateDID

async function connect() {
  // const authProvider = await createEosioAuthProvider('Test EOSIO')
  const authProvider = await createEthereumAuthProvider()
  const [accountId, did] = await Promise.all([
    authProvider.accountId(),
    authenticateDID(authProvider),
  ])
  console.log('DID:', { [did.id]: [accountId.toString()] })
}
document.getElementById('connect').addEventListener('click', connect)
