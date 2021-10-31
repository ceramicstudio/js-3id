import { atom } from 'jotai'

import { getDIDsData } from '../data/idx'
import type { DIDsData, EthereumData, RemoteProxy } from '../types'

import { remoteProxy } from './connect'

export const ethereumDataAtom = atom<EthereumData | null>(null)

export const remoteProxyAtom = atom<RemoteProxy | null>(remoteProxy)

export const didsDataAtom = atom<DIDsData | null>(null)
didsDataAtom.onMount = (setData) => {
  getDIDsData(remoteProxy.manager).then(setData)
}
