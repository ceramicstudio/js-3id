import { didDataAtom, serviceStateAtom, reqStateAtom } from './state'
import { useAtom } from 'jotai'
import type { BasicProfile } from '@datamodels/identity-profile-basic'
import { useCallback } from 'react'
import { AuthParams } from '@3id/ui-provider'
import { loadProfile } from '../data/idx'

export function useDIDBasicProfile(): [BasicProfile | null, () => Promise<void>] {
    const [didData, setDidData] = useAtom(didDataAtom)
    const [serviceState,] = useAtom(serviceStateAtom)
    const [reqState,] = useAtom(reqStateAtom)
  
    const load = useCallback(async () => {
      const did = (reqState?.params as AuthParams)?.did
      if (!serviceState?.dataStore || !did) return 
      const data = await loadProfile(did, serviceState.dataStore)
      setDidData(data)
    }, [reqState])
  
    return [didData, load]
  }
