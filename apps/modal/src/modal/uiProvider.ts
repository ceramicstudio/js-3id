import { CERAMIC_URL } from '../constants'

import { ThreeIDService } from '@3id/service'
import { DisplayConnectClientRPC } from '@3id/connect-display'
import { MigrationParams, MigrationRes, UIProvider, UIProviderHandlers, ThreeIDManagerUI, AuthParams, MigrationSkipRes, MigrationFailRes, AccountRes, AuthRes  } from '@3id/ui-provider'
import type {
  RPCErrorObject,
} from 'rpc-utils'
import { deferred } from '../utils'
import { resStatusAtom, reqStateAtom } from './state'
import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { ResponseState } from '../types'


export function useThreeIDService() {

  const [requestState, setRequestState] = useAtom(reqStateAtom)
  const [responseStatus, setResponseStatus] =  useAtom(resStatusAtom)

  const provider = useCallback(() => {
    console.log('hello')

    const connectService = new ThreeIDService()
    let iframeDisplay: DisplayConnectClientRPC
    if (window.parent) {
      iframeDisplay = new DisplayConnectClientRPC(window.parent)
    }

    const UIMethods: UIProviderHandlers = {
      prompt_migration: async (_ctx = {}, params: MigrationParams): Promise<MigrationRes> => {
        setRequestState({type: 'prompt_migration', params })
        const promise = deferred<Boolean>()
        setResponseStatus({ promise })
        const migration = await promise
        console.log({ migration })

        return { migration } 
      },
      prompt_migration_skip: async (ctx, params: {}): Promise<MigrationSkipRes> => {
        setRequestState({type: 'prompt_migration_skip', params })
        const promise = deferred<Boolean>()
        setResponseStatus({ promise })
        const skip = await promise
        return { skip } 
      },
      prompt_migration_fail: async (ctx, params: {}): Promise<MigrationFailRes> => {
        setRequestState({type: 'prompt_migration_fail', params })
        const promise = deferred<Boolean>()
        setResponseStatus({ promise })
        const createNew = await promise
        return { createNew } 
      },
      prompt_account: async (ctx, params: {}): Promise<AccountRes> => {
        setRequestState({type: 'prompt_account', params })
        const promise = deferred<Boolean>()
        setResponseStatus({ promise })
        const createNew = await promise
        return { createNew } 
      },
      // Permission request for app to access 3id-connect
      prompt_authenticate: async (ctx, params: AuthParams): Promise<AuthRes> => {
        setRequestState({type: 'prompt_authenticate', params })
        const promise = deferred<Boolean>()
        setResponseStatus({ promise })
        const allow = await promise
        return { allow } 
      },
      inform_error: (ctx, params: RPCErrorObject) => {
        setRequestState({type: 'inform_error', params })
        // change type void
        return null
      },
      inform_close: (ctx, params) => {
        if (iframeDisplay) iframeDisplay.hide()
        return null
      }
    }

    //Create a 3ID Connect UI Provider
    const provider = new UIProvider(UIMethods)
    return provider
  },[])

  // TODO set up service 


  return [provider]
}