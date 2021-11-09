import { atom, useAtom } from 'jotai'
import type { DIDsData, RequestState } from '../types'
import { create3IDService, createDIDDataStore } from './services'
import { getUIProivder } from './uiProvider'
import type { BasicProfile } from '@datamodels/identity-profile-basic'
import { ThreeIDService } from '@3id/service'
import { DIDDataStore } from '@glazed/did-datastore'
import type { CeramicApi } from '@ceramicnetwork/common'


export const didDataAtom = atom<BasicProfile | null>(null)
export const reqStateAtom = atom<RequestState | null>(null)

export type ServiceState = {
  threeidService: ThreeIDService
  ceramic: CeramicApi 
  dataStore: DIDDataStore
}

export const serviceStateAtom = atom<ServiceState | null>(null)

serviceStateAtom.onMount = (setAtom) => {
  const provider = getUIProivder(setAtom)
  const dataStore = createDIDDataStore()
  const threeidService = create3IDService(provider, dataStore)
  setAtom({ threeidService, dataStore, ceramic: dataStore.ceramic})
}