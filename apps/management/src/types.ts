import type { Manager } from '@3id/manager'
import type { AuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import type { BasicProfile } from '@datamodels/identity-profile-basic'
import type { AccountID } from 'caip'

export type DIDData = {
  accounts: Array<AccountID>
  profile: BasicProfile | null
}
export type DIDsData = Record<string, DIDData>

export type EthereumData = {
  account: AccountID
  manager: Manager
  provider: any
}

export type RemoteProxy = {
  manager: Manager
  provider: AuthProvider
}
