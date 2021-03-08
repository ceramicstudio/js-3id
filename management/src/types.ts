import type { BasicProfile } from '@ceramicstudio/idx-constants'
import type { AccountID } from 'caip'

export type ProvidedDID = Array<string> // CAIP-10 encoded accounts
export type ProvidedDIDs = Record<string, ProvidedDID>

export type ProvidedData = {
  dids: ProvidedDIDs
  linkToDID: string
}

export type DIDData = {
  accounts: Array<AccountID>
  profile: BasicProfile | null
}
export type DIDsData = Record<string, DIDData>
