import { EthereumMigrationMockAuthProvider, createEthereumAuthProvider } from '@3id/test-utils'
import {
  // CosmosAuthProvider,
  // EosioAuthProvider,
  // FilecoinAuthProvider,
  ThreeIdConnect,
} from '@3id/connect'
import ThreeIDResolver from '@ceramicnetwork/3id-did-resolver'
import Ceramic from '@ceramicnetwork/http-client'
import KeyResolver from 'key-did-resolver'
// import { Wallet as EthereumWallet } from '@ethersproject/wallet'

// These cause Webpack loading to fail at runtime
// import { Network } from '@glif/filecoin-address'
// import { LocalManagedProvider } from '@glif/local-managed-provider'
// import { EOSIOProvider } from '@smontero/eosio-local-provider'
// import {
//   signTx,
//   Tx,
//   SignMeta,
//   createWalletFromMnemonic,
//   Wallet as CosmosWallet,
//   StdTx,
// } from '@tendermint/sig'
// import { generateMnemonic } from 'bip39'
import { DID } from 'dids'
// import ecc from 'eosjs-ecc'
// import { fromString, toString } from 'uint8arrays'
// import { AccountID } from "caip"

// const FILECOIN_PRIVATE_KEY =
//   '7b2254797065223a22736563703235366b31222c22507269766174654b6579223a2257587362654d5176487a366f5668344b637262633045642b31362b3150766a6a554f3753514931355031343d227d'

// class CosmosProvider {
//   wallet: CosmosWallet

//   constructor(wallet: CosmosWallet) {
//     this.wallet = wallet
//   }

//   sign(msg: Tx, metadata: SignMeta): Promise<StdTx> {
//     return Promise.resolve(signTx(msg, metadata, this.wallet))
//   }
// }

const ceramic = new Ceramic('http://localhost:7777')
window.ceramic = ceramic

const threeIdConnect = new ThreeIdConnect('http://localhost:30001/index.html')
window.threeIdConnect = threeIdConnect

// function createCosmosAuthProvider(mnemonic?: string): Promise<CosmosAuthProvider> {
//   const wallet = createWalletFromMnemonic(mnemonic ?? generateMnemonic())
//   const provider = new CosmosProvider(wallet)
//   return Promise.resolve(new CosmosAuthProvider(provider, wallet.address, 'cosmoshub-3'))
// }

// async function createEosioAuthProvider(seed?: string): Promise<EosioAuthProvider> {
//   const privateKey = seed ? ecc.seedPrivate(seed) : await ecc.unsafeRandomKey()
//   const publicKey = ecc.privateToPublic(privateKey)
//   const keys = { [publicKey]: privateKey }
//   const account = 'eostestaccount'
//   const provider = new EOSIOProvider({
//     chainId: '2a02a0053e5a8cf73a56ba0fda11e4d92e0238a4a2aa74fccf46d5a910746840',
//     account,
//     keys,
//   })
//   // const provider = new EOSIOProvider({
//   //   chainId: '2a02a0053e5a8cf73a56ba0fda11e4d92e0238a4a2aa74fccf46d5a910746840',
//   //   account: 'idx3idctest1',
//   //   keys: {
//   //     EOS7f7hdusWKXY1cymDLvUL3m6rTLKmdyPi4e6kquSnmfVxxEwVcC:
//   //       '5JRzDcbMqvTJxjHeP8vZqZbU9PwvaaTsoQhoVTAs3xBVSZaPB9U',
//   //   },
//   // })
//   return new EosioAuthProvider(provider, 'idx3idctest1')
// }
// async function createFilecoinAuthProvider(
//   privateKey = FILECOIN_PRIVATE_KEY
// ): Promise<FilecoinAuthProvider> {
//   const provider = new LocalManagedProvider(privateKey, Network.MAIN)
//   const addresses = await provider.getAccounts()
//   return new FilecoinAuthProvider(provider, addresses[0])
// }

const providerFactories = {
  // cosmos: createCosmosAuthProvider,
  // eosio: createEosioAuthProvider,
  ethereum: createEthereumAuthProvider,
  ethereumMockMigration: () => new EthereumMigrationMockAuthProvider(),
  // filecoin: createFilecoinAuthProvider,
}
type Providers = typeof providerFactories

async function createAuthProvider<T extends keyof Providers>(
  type: T,
  seed?: string
): Promise<ReturnType<Providers[T]>> {
  const createProvider = providerFactories[type]
  return await createProvider(seed)
}
window.createAuthProvider = createAuthProvider

function createDID(provider): DID {
  return new DID({
    provider,
    resolver: { ...KeyResolver.getResolver(), ...ThreeIDResolver.getResolver(ceramic) },
  })
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
  const authProvider = await createAuthProvider('ethereum')
  const [accountId, did] = await Promise.all([
    authProvider.accountId(),
    authenticateDID(authProvider),
  ])
  console.log('DID:', { [did.id]: [accountId.toString()] })
  return did.id
}
document.getElementById('connect').addEventListener('click', connect)

window.connect = connect
