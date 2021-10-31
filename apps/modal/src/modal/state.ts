import { atom } from 'jotai'

import { getDIDsData } from '../data/idx'
import type { DIDsData, EthereumData, RemoteProxy, ResponseState } from '../types'
import type { UIRequest, UIMethodName  } from '@3id/ui-provider'


type UIProvRequest<K extends UIMethodName = UIMethodName> = {
    type: K
    params:UIRequest<K>['params']
}

export const didsDataAtom = atom<DIDsData | null>(null)
export const resStatusAtom = atom<ResponseState | null>(null)
export const reqStateAtom = atom<UIProvRequest | null>(null)


// didsDataAtom.onMount = (setData) => {
//   getDIDsData(remoteProxy.manager).then(setData)
// }
