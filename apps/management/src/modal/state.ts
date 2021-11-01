import { atom } from 'jotai'
import type { DIDsData, RequestState } from '../types'
import { create3IDService } from './uiProvider'

export const didsDataAtom = atom<DIDsData | null>(null)
export const reqStateAtom = atom<RequestState | null>(null)

reqStateAtom.onMount = (setAtom) => {
  create3IDService(setAtom)
}