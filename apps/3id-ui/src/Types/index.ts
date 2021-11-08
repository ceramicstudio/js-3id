import CeramicClient from '@ceramicnetwork/http-client'
import { IDX } from '@ceramicstudio/idx'

export type RequestType = {
  type: string
  paths?: Array<string>
  did?: string
  legacyDid?: string
  message?: string
}

export type ConnectServiceType = {
  idx?: IDX
  ceramic?: CeramicClient
}

export type UIState = {
  params: RequestType
  acceptButton: ButtonType
  declineButton: ButtonType
  deferredPromise?: Deferred<boolean>
  closeNode: () => {}
}

export type ButtonType = {
  loading: boolean
<<<<<<< HEAD
  class: 'primary' | 'secondary'
  body?: string
  resolve?: PromiseLike<boolean>
}

export type Deferred<T> = Promise<T> & {
  resolve: (value?: T | PromiseLike<T>) => void
  reject: (reason?: any) => void
=======
  body: string
  click?: Function
  class?: string
  set: Function
  get: Function
>>>>>>> feat/3id-ui-polish
}

export type StoreBody = {
  loading: boolean
  body: string
  click?: Function
  class?: string
}
