import CeramicClient from '@ceramicnetwork/http-client'
import { DIDDataStore } from '@glazed/did-datastore'

export type RequestType = {
  type: string
  paths?: Array<string>
  did?: string
  legacyDid?: string
  message?: string
}

export type ButtonsType = {
  acceptNode: JSX.Element
  declineNode: JSX.Element
  closeNode: JSX.Element
}

export type ConnectServiceType = {
  dataStore?: DIDDataStore
  ceramic?: CeramicClient
}
