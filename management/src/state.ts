import { atom } from 'jotai'

import type { DIDsData, EthereumData, RemoteProxy } from './types'

export const didsDataAtom = atom<DIDsData | null>(null)
export const ethereumDataAtom = atom<EthereumData | null>(null)
export const remoteProxyAtom = atom<RemoteProxy | null>(null)
