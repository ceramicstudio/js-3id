import { atom } from 'jotai'
import type { RequestState } from '../types'
import { create3IDService, createDIDDataStore } from './services'
import { getUIProvider} from './uiProvider'
import type { BasicProfile } from '@datamodels/identity-profile-basic'
import { ThreeIDService } from '@3id/connect-service'
import { DIDDataStore } from '@glazed/did-datastore'
import type { CeramicApi } from '@ceramicnetwork/common'
import { UIProvider } from '@3id/ui-provider'
import { deferred } from '../utils'
import type { Response } from '../types'


export const didDataAtom = atom<BasicProfile | null>(null)
export const reqStateAtom = atom<RequestState | null>(null)

export type ServiceState = {
  threeidService: ThreeIDService
  ceramic: CeramicApi 
  dataStore: DIDDataStore
  provider: UIProvider
}

export const serviceStateAtom = atom<ServiceState | null>(null)

export const initAtom = atom(null, (get, set) => {
  const dataStore = createDIDDataStore()
  const provider = getUIProvider((update) => set(reqStateAtom, update))
  const threeidService = create3IDService(provider, dataStore)
  set(serviceStateAtom, { threeidService, dataStore, ceramic: dataStore.ceramic, provider})
})

initAtom.onMount = (setAtom) => {
  setAtom()
}