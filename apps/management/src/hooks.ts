import { useMultiAuth } from '@ceramicstudio/multiauth'
import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { getManager } from './data/connect'
import { didsDataAtom, ethereumDataAtom, remoteProxyAtom } from './state'
import type { DIDsData, EthereumData, RemoteProxy } from './types'

export function useEthereum(): [EthereumData | null, () => Promise<EthereumData | null>] {
  const connectWallet = useMultiAuth()[1]
  const [data, setData] = useAtom(ethereumDataAtom)

  const connect = useCallback(() => {
    return connectWallet({ mode: 'select' }).then(
      (authAccount) => {
        if (authAccount == null) {
          return null
        }
        const { provider } = authAccount.provider.state
        const nextData = { account: authAccount.accountID, manager: getManager(provider), provider }
        setData(nextData)
        return nextData
      },
      (err) => {
        console.warn('Failed to handle activation on connect', err)
        return null
      }
    )
  }, [connectWallet, setData])

  return [data, connect]
}

export function useRemoteProxy(): RemoteProxy | null {
  return useAtom(remoteProxyAtom)[0]
}

export function useDIDsData(): DIDsData | null {
  return useAtom(didsDataAtom)[0]
}
