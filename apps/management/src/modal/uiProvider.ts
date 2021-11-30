import { DisplayConnectClientRPC } from '@3id/connect-display'
import { MigrationParams, MigrationRes, UIProvider, UIProviderHandlers, ThreeIDManagerUI, AuthParams, MigrationSkipRes, MigrationFailRes, AccountRes, AuthRes, UIMethodName  } from '@3id/ui-provider'
import {
  RPCErrorObject,
  RPCError
} from 'rpc-utils'
import { deferred } from '../utils'
import type { SetStateAction } from 'jotai'
import type { RequestState, Response } from '../types'

export function getUIProvider(setRequestState: (update: SetStateAction<RequestState | null>) => void) {

    // TODO move
    let iframeDisplay: DisplayConnectClientRPC
    if (window.parent) {
      iframeDisplay = new DisplayConnectClientRPC(window.parent)
    }

    const status = 'active'

    // TODO move iframe display
    const UIMethods: UIProviderHandlers = {
      prompt_migration: async (_ctx = {}, params: MigrationParams): Promise<MigrationRes> => {
        await iframeDisplay.display(undefined, '100%', '100%')
        const respond = deferred<Response>()
        setRequestState({type: 'prompt_migration', params, respond, status  })
        const res = await respond
        if (res.error) throw new RPCError(4100, 'cancellation')
        return { migration: res.result } 
      },
      prompt_migration_skip: async (ctx, params: {}): Promise<MigrationSkipRes> => {
        await iframeDisplay.display(undefined, '100%', '100%')
        const respond = deferred<Response>()
        setRequestState({type: 'prompt_migration_skip', params, respond, status  })
        const res = await respond
        if (res.error) throw new RPCError(4100, 'cancellation')
        return { skip: res.result } 
      },
      prompt_migration_fail: async (ctx, params: {}): Promise<MigrationFailRes> => {
        await iframeDisplay.display(undefined, '100%', '100%')
        const respond = deferred<Response>()
        setRequestState({type: 'prompt_migration_fail', params, respond, status  })
        const res = await respond
        if (res.error) throw new RPCError(4100, 'cancellation')
        return { createNew: res.result } 
      },
      prompt_account: async (ctx, params: {}): Promise<AccountRes> => {
        await iframeDisplay.display(undefined, '100%', '100%')
        const respond = deferred<Response>()
        setRequestState({type: 'prompt_account', params, respond, status  })
        const res = await respond
        if (res.error) throw new RPCError(4100, 'cancellation')
        return { createNew: res.result } 
      },
      prompt_authenticate: async (ctx, params: AuthParams): Promise<AuthRes> => {
        await iframeDisplay.display(undefined, '100%', '100%')
        const respond = deferred<Response>()
        setRequestState({type: 'prompt_authenticate', params, respond, status  })
        const res = await respond
        if (res.error) throw new RPCError(4100, 'cancellation')
        return { allow: res.result }
      },
      inform_error: async (ctx, params: RPCErrorObject) => {
        const respond = deferred<Response>()
        setRequestState({type: 'inform_error', params, respond, status  })
        const res = await respond
        if (res.error && iframeDisplay) iframeDisplay.hide()
        return null
      },
      inform_close: (ctx, params) => {
        if (iframeDisplay) iframeDisplay.hide()
        return null
      }
    }

    return new UIProvider(UIMethods)
}