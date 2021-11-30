import { CERAMIC_URL } from '../constants'
import { ThreeIDService } from '@3id/service'
import type {  UIProvider } from '@3id/ui-provider'
import { model as idxModel } from '@3id/manager'
import { DIDDataStore } from '@glazed/did-datastore'
import CeramicClient from '@ceramicnetwork/http-client'

export function create3IDService(uiProvider: UIProvider, didDataStore: DIDDataStore ) {
  const connectService = new ThreeIDService()
  // TODO
  connectService.start(uiProvider, didDataStore)
  return connectService
}

export function createDIDDataStore() {
  const ceramic = new CeramicClient(CERAMIC_URL, { syncInterval: 30 * 60 * 1000 })
  return new DIDDataStore({ ceramic, model: idxModel })
}