import { EthereumAuthProvider, Manage3IDs } from '3id-connect'
import type { EthereumProvider } from '3id-connect'

import { ceramic } from './ceramic'

export function getManager(provider: EthereumProvider): Manage3IDs {
  const authProvider = new EthereumAuthProvider(
    provider,
    (provider as any).selectedAddress,
  )
  return new Manage3IDs(authProvider, { ceramic })
}
