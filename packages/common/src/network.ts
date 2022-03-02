import { Network } from './types.js'

export const VALID_NETWORKS = ['dev-unstable', 'testnet-clay', 'mainnet', 'local']
const version = 'v2'

// PRIVATE NODES, could be moved to private package/const later
export const DEV_API_URL = 'https://ceramic-private-dev.3boxlabs.com'
export const CLAY_API_URL = 'https://ceramic-private-clay.3boxlabs.com'
export const MAIN_API_URL = 'https://ceramic-private.3boxlabs.com'
export const LOCAL_API_URL = 'http://localhost:7007'

// Base iframe urls by network
export const BASE_IFRAME_DEV_URL = `https://app-dev.3idconnect.org/${version}`
export const BASE_IFRAME_CLAY_URL = `https://app-clay.3idconnect.org/${version}`
export const BASE_IFRAME_MAIN_URL = `https://app.3idconnect.org/${version}`
export const BASE_IFRAME_LOCAL_URL = `http://localhost:30001/${version}`
export const DEFAULT_IFRAME_MANAGE_PATH = `/management.html`
export const DEFAULT_IFRAME_PATH = `/index.html`

export const CERAMIC_NETWORK_API: Record<Network, string> = {
  'dev-unstable': DEV_API_URL,
  'testnet-clay': CLAY_API_URL,
  mainnet: MAIN_API_URL,
  local: LOCAL_API_URL,
}

export const CERAMIC_NETWORK_IFRAME: Record<Network, string> = {
  'dev-unstable': BASE_IFRAME_DEV_URL,
  'testnet-clay': BASE_IFRAME_CLAY_URL,
  mainnet: BASE_IFRAME_MAIN_URL,
  local: BASE_IFRAME_LOCAL_URL,
}

export const iframeManageUrl = (base: string) => `${base}${DEFAULT_IFRAME_MANAGE_PATH}`
export const iframeUrl = (base: string) => `${base}${DEFAULT_IFRAME_PATH}`
export const iframeByNetwork = (network: Network) => CERAMIC_NETWORK_IFRAME[network]
export const apiByNetwork = (network: Network) => CERAMIC_NETWORK_API[network]
export const isValidNetwork = (network: string) => VALID_NETWORKS.includes(network)

export const DIDRPCNameSpace = '3id-connect-did-provider'
