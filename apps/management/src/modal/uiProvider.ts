import { CERAMIC_URL } from '../constants'

import { ThreeIDService } from '@3id/service'
import { DisplayConnectClientRPC } from '@3id/connect-display'
import { MigrationParams, MigrationRes, UIProvider, UIProviderHandlers, ThreeIDManagerUI, AuthParams, MigrationSkipRes, MigrationFailRes, AccountRes, AuthRes  } from '@3id/ui-provider'
import type {
  RPCErrorObject,
} from 'rpc-utils'
import { deferred } from '../utils'

export function getUIProivder(setRequestState) {
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

    // TODO close on any cancellation

    //Create a 3ID Connect UI Provider
    return new UIProvider(UIMethods)
}

export function create3IDService(setRequestState) {
  const connectService = new ThreeIDService()
  const provider = getUIProivder(setRequestState)
  // REmove closing and just handle with cancellation 
  connectService.start(provider, () => {}, CERAMIC_URL)
}