import CeramicClient from '@ceramicnetwork/http-client'
import { IDX } from '@ceramicstudio/idx'

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
  idx?: IDX
  ceramic?: CeramicClient
}

export type AtomType = {
  loading: boolean
  body: string
}

export type Store = {
  loading: boolean
  body: string
  set: Function
  get: Function
}
