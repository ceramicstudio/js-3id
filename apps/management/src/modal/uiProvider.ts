import { CERAMIC_URL } from '../constants'

import { ThreeIDService } from '@3id/service'
import { DisplayConnectClientRPC } from '@3id/connect-display'
import { MigrationParams, MigrationRes, UIProvider, UIProviderHandlers, ThreeIDManagerUI, AuthParams, MigrationSkipRes, MigrationFailRes, AccountRes, AuthRes  } from '@3id/ui-provider'
import type {
  RPCErrorObject,
} from 'rpc-utils'
import { deferred } from '../utils'
import { reqStateAtom } from './state'
import { useAtom } from 'jotai'
import { useCallback } from 'react'


export function useThreeIDService() {

  const [requestState, setRequestState] = useAtom(reqStateAtom)

  const provider = useCallback(() => {
    console.log('hello')

    const connectService = new ThreeIDService()
    let iframeDisplay: DisplayConnectClientRPC
    if (window.parent) {
      iframeDisplay = new DisplayConnectClientRPC(window.parent)
    }

    const UIMethods: UIProviderHandlers = {
      prompt_migration: async (_ctx = {}, params: MigrationParams): Promise<MigrationRes> => {
        const respond = deferred<boolean>()
        setRequestState({type: 'prompt_migration', params, respond })
        const migration = await respond
        console.log({ migration })
        return { migration } 
      },
      prompt_migration_skip: async (ctx, params: {}): Promise<MigrationSkipRes> => {
        const respond = deferred<boolean>()
        setRequestState({type: 'prompt_migration_skip', params, respond })
        const skip = await respond
        return { skip } 
      },
      prompt_migration_fail: async (ctx, params: {}): Promise<MigrationFailRes> => {
        const respond = deferred<boolean>()
        setRequestState({type: 'prompt_migration_fail', params, respond })
        const createNew = await respond
        return { createNew } 
      },
      prompt_account: async (ctx, params: {}): Promise<AccountRes> => {
        const respond = deferred<boolean>()
        setRequestState({type: 'prompt_account', params, respond })
        const createNew = await respond
        return { createNew } 
      },
      prompt_authenticate: async (ctx, params: AuthParams): Promise<AuthRes> => {
        const respond = deferred<boolean>()
        setRequestState({type: 'prompt_authenticate', params, respond })
        const allow = await respond
        return { allow }
      },
      inform_error: (ctx, params: RPCErrorObject) => {
        const respond = deferred<boolean>()
        setRequestState({type: 'inform_error', params, respond })
        // response may be to close window
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