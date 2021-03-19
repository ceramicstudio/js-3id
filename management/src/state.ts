import { atom } from 'jotai'

import { remoteProxy } from './data/connect'
import { getDIDsData } from './data/idx'
import type { DIDsData, EthereumData, RemoteProxy } from './types'

export const ethereumDataAtom = atom<EthereumData | null>(null)

export const remoteProxyAtom = atom<RemoteProxy>(remoteProxy)

export const didsDataAtom = atom<DIDsData | null>(null)
didsDataAtom.onMount = (setData) => {
  getDIDsData(remoteProxy.manager).then(setData)
}
