import { Network } from './types'

export const VALID_NETWORKS = ['dev-unstable', 'testnet-clay', 'mainnet', 'local']

// PRIVATE NODES, could be moved to private package/const later
export const DEV_API_URL = 'https://ceramic-private-dev.3boxlabs.com'
export const CLAY_API_URL = 'https://ceramic-private-clay.3boxlabs.com'
export const MAIN_API_URL = 'https://ceramic-private.3boxlabs.com'
export const LOCAL_API_URL = 'http://localhost:7007'

// Base iframe urls by network
export const BASE_IFRAME_DEV_URL = 'https://app-dev.3idconnect.org'
export const BASE_IFRAME_CLAY_URL = 'https://app-clay.3idconnect.org'
export const BASE_IFRAME_MAIN_URL = 'https://app.3idconnect.org'
export const BASE_IFRAME_LOCAL_URL = `http://localhost:30001`
export const DEFAULT_IFRAME_MANAGE_PATH = `/management/index.html`

export const CERAMIC_NETWORK_API: Record<Network, string> = {
  'dev-unstable': DEV_API_URL,
  'testnet-clay': CLAY_API_URL,
  'mainnet': MAIN_API_URL,
  'local' : LOCAL_API_URL,
}

export const CERAMIC_NETWORK_IFRAME: Record<Network, string> = {
  'dev-unstable': BASE_IFRAME_DEV_URL,
  'testnet-clay': BASE_IFRAME_CLAY_URL,
  'mainnet': BASE_IFRAME_MAIN_URL,
  'local' : BASE_IFRAME_LOCAL_URL,
}

export const iframeManageUrl = (base: string) => `${base}${DEFAULT_IFRAME_MANAGE_PATH}`
export const iframeByNetwork = (network: Network) => CERAMIC_NETWORK_IFRAME[network]
export const apiByNetwork = (network: Network) => CERAMIC_NETWORK_API[network]
export const isValidNetwork = (network: string) => VALID_NETWORKS.includes(network)

  