import { atom } from 'jotai'
import type { RequestState } from '../types'
import { create3IDService, createDIDDataStore } from './services'
import { getUIProivder} from './uiProvider'
import { testUIReq } from './uiProvider'
import type { BasicProfile } from '@datamodels/identity-profile-basic'
import { ThreeIDService } from '@3id/service'
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
  const provider = getUIProivder((update) => set(reqStateAtom, update))
  // TESTING
  const update = {
    type: "prompt_authenticate",
    params: {
      did: 'did:3:jmz1...23nqr',
      origin: undefined,
      paths: [],
      caip10: '0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb@eip155:1'
    },
    respond: deferred<Response>(),
    status: 'active'
  }
  // TODO, need CAIP or move close button
  // const update = {
  //   type: "prompt_account",
  //   params: {
  //     caip10: '0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb@eip155:1'
  //   },
  //   respond: deferred<Response>(),
  //   status: 'active'
  // }
  // const update = {
  //   type: "prompt_migration",
  //   params: {
  //     legacyDid: 'did:3id:jmz1...23nqr',
  //     caip10: '0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb@eip155:1'
  //   },
  //    respond: deferred<Response>(),
  //   status: 'active'
  // }
  // const update = {
  //   type: "prompt_migration_skip",
  //   params: {
  //     caip10: '0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb@eip155:1'
  //   },
  //   respond: deferred<Response>(),
  //   status: 'active'
  // }
  // const update = {
  //   type: "prompt_migration_fail",
  //    params: {
  //     caip10: '0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb@eip155:1'
  //   },
  //    respond: deferred<Response>(),
  //   status: 'active'
  // }
  // const update = {
  //   type: "inform_error",
  //    respond: deferred<Response>(),
  //   status: 'active'
  // }

  //@ts-ignore
  set(reqStateAtom, update)
  const threeidService = create3IDService(provider, dataStore)
  set(serviceStateAtom, { threeidService, dataStore, ceramic: dataStore.ceramic, provider})
  // // Testing 
  // testUIReq(provider,'prompt_account')
})

initAtom.onMount = (setAtom) => {
  setAtom()
}