// Re-exports from blockchain-utils-linking
import { eosio, ethereum } from '@ceramicnetwork/blockchain-utils-linking'
export const EosioAuthProvider = eosio.EosioAuthProvider
export const EthereumAuthProvider = ethereum.EthereumAuthProvider
export type { AuthProvider } from '@ceramicnetwork/blockchain-utils-linking'

export { default as ConnectService } from './connectService'
export { default as DidProviderProxy } from './didProviderProxy'
export { default as ThreeIdConnect } from './threeIdConnect'
export * from './types'
