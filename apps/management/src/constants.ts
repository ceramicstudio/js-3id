import type { Network } from './types'

export const IPFS_API_URL = 'https://ipfs.infura.io:5001/api/v0'
export const IPFS_URL = 'https://ipfs.infura.io/ipfs/'
export const IPFS_PREFIX = 'ipfs://'

const CERAMIC_URLS: Record<Network, string> = {
  'dev-unstable': 'https://ceramic-private-dev.3boxlabs.com',
  'testnet-clay': 'https://ceramic-private-clay.3boxlabs.com',
  mainnet: 'https://ceramic-private.3boxlabs.com',
  local: 'http://localhost:7007',
}

export const NETWORK = (process.env.NEXT_PUBLIC_CERAMIC_NETWORK as Network) ?? 'mainnet'

export const CERAMIC_URL =
  process.env.NEXT_PUBLIC_CERAMIC_API ?? CERAMIC_URLS[NETWORK] ?? CERAMIC_URLS.mainnet
