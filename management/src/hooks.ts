import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import type { Manage3IDs } from '3id-connect'
import { AccountID } from 'caip'
import type { ChainIDParams } from 'caip'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'

import { createRemoteProxy, getManager, transport } from './data/connect'
import { toChainId } from './data/ethereum'
import { getDIDsData } from './data/idx'
import { didsDataAtom, ethereumDataAtom, remoteProxyAtom } from './state'
import type { DIDsData, EthereumData, RemoteProxy } from './types'

const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42] })

export function useEthereum(): [EthereumData | null, () => Promise<void>] {
  const { activate, error } = useWeb3React<Manage3IDs>()
  const [data, setData] = useAtom(ethereumDataAtom)

  const handleAccount = useCallback(
    async (
      providedAddress?: string,
      providedChainId?: ChainIDParams | string | number,
    ) => {
      try {
        const [provider, address, chainId] = await Promise.all([
          injected.getProvider(),
          providedAddress ?? injected.getAccount(),
          providedChainId ?? injected.getChainId(),
        ])
        if (address == null) {
          throw new Error('Could not get address')
        }
        const account = new AccountID({
          address,
          chainId: toChainId(chainId),
        })
        const manager = getManager(provider)
        // @ts-ignore
        window.manager = manager
        setData({ account, manager, provider })
      } catch (err) {
        console.warn('Failed to handle setting accountId', err)
      }
    },
    [setData],
  )

  const connect = useCallback(() => {
    return activate(injected).then(
      () => handleAccount(),
      (err) => {
        console.warn('Failed to handle activation on connect', err)
      },
    )
  }, [activate, handleAccount])

  useEffect(() => {
    const { ethereum } = window as any
    if (ethereum != null && typeof ethereum.on === 'function' && !error) {
      const handleChainChanged = (chainId: string | number) => {
        activate(injected).then(
          () => handleAccount(data?.account.address, chainId),
          (err) => {
            console.warn('Failed to handle activation on chain changed', err)
          },
        )
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          activate(injected).then(
            () =>
              handleAccount(
                accounts[0],
                data?.account.chainId
                  ? toChainId(data.account.chainId.toString())
                  : undefined,
              ),
            (err) => {
              console.warn(
                'Failed to handle activation on accounts changed',
                err,
              )
            },
          )
        }
      }

      const handleNetworkChanged = (networkId: string | number) => {
        activate(injected).then(
          () => {
            if (data?.account == null) {
              handleAccount()
            }
          },
          (err) => {
            console.warn('Failed to handle activation on accounts changed', err)
          },
        )
      }

      ethereum.on('connect', connect)
      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('networkChanged', handleNetworkChanged)

      return () => {
        if (typeof ethereum.removeListener === 'function') {
          ethereum.removeListener('connect', connect)
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
          ethereum.removeListener('networkChanged', handleNetworkChanged)
        }
      }
    }
  }, [data?.account, activate, connect, error, handleAccount])

  return [data, connect]
}

export function useRemoteProxy(): RemoteProxy | null {
  return useAtom(remoteProxyAtom)[0]
}

export function useConnectRemoteProxy(): RemoteProxy | null {
  const [proxy, setProxy] = useAtom(remoteProxyAtom)

  useEffect(() => {
    const sub = transport.subscribe({
      next(event) {
        if (event.data === '3id-connect-inject-provider') {
          setProxy(createRemoteProxy(event.source as Window))
        }
      },
    })

    return () => {
      sub.unsubscribe()
    }
  })

  return proxy
}

export function useDIDsData(): DIDsData | null {
  const proxy = useRemoteProxy()
  const [data, setData] = useAtom(didsDataAtom)
  const handleProvided = useRef(0)

  function handler() {
    if (proxy != null) {
      const currentHandle = ++handleProvided.current
      getDIDsData(proxy.manager).then((newData) => {
        if (currentHandle === handleProvided.current) {
          setData(newData)
        }
      })
    }
  }
  useEffect(handler, [proxy, setData])

  return data
}
