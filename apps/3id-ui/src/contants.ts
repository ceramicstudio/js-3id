import {
  isValidNetwork,
  apiByNetwork,
  Network
} from '@3id/common'
  
export const DEFAULT_NETWORK = 'mainnet'
const envNet = process.env.REACT_APP_CERAMIC_NETWORK

export const NETWORK = isValidNetwork(envNet || '') ? envNet : DEFAULT_NETWORK
export const CERAMIC_URL = process.env.REACT_APP_CERAMIC_API ?? apiByNetwork(NETWORK as Network)