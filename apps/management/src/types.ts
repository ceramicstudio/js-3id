import type { BasicProfile } from '@ceramicstudio/idx-constants'
import type { AuthProvider, EthereumProvider, Manage3IDs } from '3id-connect'
import type { AccountID } from 'caip'

export type DIDData = {
  accounts: Array<AccountID>
  profile: BasicProfile | null
}
export type DIDsData = Record<string, DIDData>

export type EthereumData = {
  account: AccountID
  manager: Manage3IDs
  provider: EthereumProvider
}

export type RemoteProxy = {
  manager: Manage3IDs
  provider: AuthProvider
}
