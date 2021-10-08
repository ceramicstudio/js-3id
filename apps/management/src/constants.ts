import {
  isValidNetwork,
  apiByNetwork,
  Network
} from '@3id/common'

export const IPFS_API_URL = 'https://ipfs.infura.io:5001/api/v0'
export const IPFS_URL = 'https://ipfs.infura.io/ipfs/'
export const IPFS_PREFIX = 'ipfs://'

export const DEFAULT_NETWORK = 'mainnet'
const envNet = process.env.NEXT_PUBLIC_CERAMIC_NETWORK

export const NETWORK = isValidNetwork(envNet || '') ? envNet : DEFAULT_NETWORK
export const CERAMIC_URL = process.env.NEXT_PUBLIC_CERAMIC_API ?? apiByNetwork(NETWORK as Network)
