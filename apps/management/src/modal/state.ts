import { atom } from 'jotai'
import type { DIDsData, RequestState } from '../types'

export const didsDataAtom = atom<DIDsData | null>(null)
export const reqStateAtom = atom<RequestState | null>(null)
