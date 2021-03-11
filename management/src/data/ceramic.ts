import Ceramic from '@ceramicnetwork/http-client'

import { CERAMIC_URL } from '../constants'

export const ceramic = new Ceramic(CERAMIC_URL)
