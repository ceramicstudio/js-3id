import { EthereumAuthProvider, Manage3IDs } from '3id-connect'
import { atom } from 'jotai'

import type { DIDsData, EthereumData, RemoteProxy } from './types'

// Temporary mock for testing
const provider = new EthereumAuthProvider({}, 'foo')
const manager = new Manage3IDs(provider, {})
const proxy = { manager, provider }

export const didsDataAtom = atom<DIDsData | null>(null)
export const ethereumDataAtom = atom<EthereumData | null>(null)
export const remoteProxyAtom = atom<RemoteProxy | null>(proxy)
