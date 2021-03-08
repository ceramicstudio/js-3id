import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import { AccountID } from 'caip'
import type { ChainIDParams } from 'caip'
import { useCallback, useEffect, useRef, useState } from 'react'

import { CONNECT_ORIGIN, TEST_PROVIDED_DATA } from './constants'
import { loadProfile } from './idx'
import type { DIDsData, ProvidedData } from './types'

const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42] })

export function useProvidedData(): ProvidedData | null {
  const [data, setData] = useState<ProvidedData | null>(null)

  useEffect(() => {
    setData(TEST_PROVIDED_DATA)

    function listener(event: MessageEvent) {
      if (event.origin !== CONNECT_ORIGIN) {
        return
      }

      // TODO: try to parse and set data
    }
    window.addEventListener('message', listener, false)

    return () => {
      window.removeEventListener('message', listener)
    }
  }, [])

  return data
}

export function useDIDsData(): DIDsData | null {
  const provided = useProvidedData()
  const [data, setData] = useState<DIDsData>({})
  const handleProvided = useRef(0)

  function handler() {
    if (provided !== null) {
      const currentHandle = ++handleProvided.current
      Promise.all(
        Object.entries(provided.dids).map(async ([did, accounts]) => ({
          did,
          accounts: accounts.map((account) => new AccountID(account)),
          profile: await loadProfile(did),
        })),
      ).then((entries) => {
        if (currentHandle === handleProvided.current) {
          const newData = entries.reduce((acc, { did, ...entry }) => {
            acc[did] = entry
            return acc
          }, {} as DIDsData)
          setData(newData)
        }
      })
    }
  }
  useEffect(handler, [provided])

  return data
}

const CHAIN_IDS: Record<string, string> = {
  // Mainnet
  '0x01': '1',
  '0x1': '1',
  // Ropsten
  '0x03': '3',
  '0x3': '3',
  // Rinkeby
  '0x04': '4',
  '0x4': '4',
  // Goerli
  '0x05': '5',
  '0x5': '5',
  // Kovan
  '0x2a': '42',
}

function toChainId(id: ChainIDParams | string | number): ChainIDParams {
  return typeof id === 'object'
    ? id
    : {
        namespace: 'eip155',
        reference: typeof id === 'number' ? id.toString() : CHAIN_IDS[id] || id,
      }
}

export function useEthereumAccount(): [
  AccountID | undefined,
  () => Promise<void>,
] {
  const { activate, error } = useWeb3React()
  const [accountId, setAccountId] = useState<AccountID>()

  async function handleAccount(
    providedAddress?: string,
    providedChainId?: ChainIDParams | string | number,
  ) {
    try {
      const [address, chainId] = await Promise.all([
        providedAddress ?? injected.getAccount(),
        providedChainId ?? injected.getChainId(),
      ])
      if (address != null) {
        const id = new AccountID({ address, chainId: toChainId(chainId) })
        setAccountId(id)
      }
    } catch (err) {
      console.warn('Failed to handle setting accountId', err)
    }
  }

  const connect = useCallback(() => {
    return activate(injected).then(
      () => handleAccount(),
      (err) => {
        console.warn('Failed to handle activation on connect', err)
      },
    )
  }, [activate])

  useEffect(() => {
    const { ethereum } = window as any
    if (ethereum != null && typeof ethereum.on === 'function' && !error) {
      const handleChainChanged = (chainId: string | number) => {
        activate(injected).then(
          () => handleAccount(accountId?.address, chainId),
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
                accountId?.chainId
                  ? toChainId(accountId.chainId.toString())
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
            if (accountId == null) {
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
  }, [accountId, activate, connect, error])

  return [accountId, connect]
}
