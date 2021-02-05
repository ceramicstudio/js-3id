// Re-exports from blockchain-utils-linking
export {
  CosmosAuthProvider,
  EosioAuthProvider,
  EthereumAuthProvider,
  FilecoinAuthProvider,
  PolkadotAuthProvider,
} from '@ceramicnetwork/blockchain-utils-linking'
export type { AuthProvider } from '@ceramicnetwork/blockchain-utils-linking'

export { default as ConnectService } from './connectService'
export { default as DidProviderProxy } from './didProviderProxy'
export { default as ThreeIdConnect } from './threeIdConnect'
export * from './types'
