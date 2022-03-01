import type { Manager } from '@3id/did-manager'
import type { AuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import type { BasicProfile } from '@datamodels/identity-profile-basic'
import type { AccountId } from 'caip'
import type { UIRequest, UIMethodName  } from '@3id/ui-provider'
import { Deferred } from './utils'

export type DIDData = {
  accounts: Array<AccountId>
  profile: BasicProfile | null
}
export type DIDsData = Record<string, DIDData>

export type EthereumData = {
  account: AccountId
  manager: Manager
  provider: any
}

export type RemoteProxy = {
  manager: Manager
  provider: AuthProvider
}

export type ErrorType = 'cancellation'

export type Response = {
  result: boolean
  error?: never
} | {
  result?: never
  error: ErrorType
}

export type RequestState<K extends UIMethodName = UIMethodName> = {
  type: K
  params:UIRequest<K>['params'],
  respond: Deferred<Response>
  status: 'active' | 'pending'
}

export type ButtonProps = {
  label: string
  onClick?: (this: any, e: any) => void
  status?: 'active' | 'pending',
  href?: string
  loadingLabel?: string
}

