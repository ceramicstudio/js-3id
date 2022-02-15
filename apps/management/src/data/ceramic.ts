import { CeramicClient } from '@ceramicnetwork/http-client'
import { CERAMIC_URL } from '../constants'

export const ceramic = new CeramicClient(CERAMIC_URL)
