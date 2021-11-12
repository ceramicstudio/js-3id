import { DisplayConnectClientRPC } from '@3id/connect-display'
import { MigrationParams, MigrationRes, UIProvider, UIProviderHandlers, ThreeIDManagerUI, AuthParams, MigrationSkipRes, MigrationFailRes, AccountRes, AuthRes, UIMethodName  } from '@3id/ui-provider'
import {
  RPCErrorObject,
  RPCError
} from 'rpc-utils'
import { deferred } from '../utils'
import type { SetStateAction } from 'jotai'
import type { RequestState, Response } from '../types'

export function getUIProivder(setRequestState: (update: SetStateAction<RequestState | null>) => void) {

    // TODO move
    let iframeDisplay: DisplayConnectClientRPC
    if (window.parent) {
      iframeDisplay = new DisplayConnectClientRPC(window.parent)
    }

    // TODO move iframe display
    const UIMethods: UIProviderHandlers = {
      prompt_migration: async (_ctx = {}, params: MigrationParams): Promise<MigrationRes> => {
        await iframeDisplay.display(undefined, '100%', '100%')
        const respond = deferred<Response>()
        setRequestState({type: 'prompt_migration', params, respond })
        const res = await respond
        if (res.error) throw new RPCError(4100, 'cancellation')
        return { migration: res.result } 
      },
      prompt_migration_skip: async (ctx, params: {}): Promise<MigrationSkipRes> => {
        await iframeDisplay.display(undefined, '100%', '100%')
        const respond = deferred<Response>()
        setRequestState({type: 'prompt_migration_skip', params, respond })
        const res = await respond
        if (res.error) throw new RPCError(4100, 'cancellation')
        return { skip: res.result } 
      },
      prompt_migration_fail: async (ctx, params: {}): Promise<MigrationFailRes> => {
        await iframeDisplay.display(undefined, '100%', '100%')
        const respond = deferred<Response>()
        console.log('fail')
        setRequestState({type: 'prompt_migration_fail', params, respond })
        const res = await respond
        if (res.error) throw new RPCError(4100, 'cancellation')
        return { createNew: res.result } 
      },
      prompt_account: async (ctx, params: {}): Promise<AccountRes> => {
        await iframeDisplay.display(undefined, '100%', '100%')
        const respond = deferred<Response>()
        setRequestState({type: 'prompt_account', params, respond })
        const res = await respond
        if (res.error) throw new RPCError(4100, 'cancellation')
        return { createNew: res.result } 
      },
      prompt_authenticate: async (ctx, params: AuthParams): Promise<AuthRes> => {
        await iframeDisplay.display(undefined, '100%', '100%')
        const respond = deferred<Response>()
        setRequestState({type: 'prompt_authenticate', params, respond })
        const res = await respond
        if (res.error) throw new RPCError(4100, 'cancellation')
        return { allow: res.result }
      },
      inform_error: (ctx, params: RPCErrorObject) => {
        const respond = deferred<Response>()
        setRequestState({type: 'inform_error', params, respond })
        // response may be to close window
        return null
      },
      inform_close: (ctx, params) => {
        if (iframeDisplay) iframeDisplay.hide()
        return null
      }
    }

    return new UIProvider(UIMethods)
}

export function testUIReq(uiProvider: UIProvider, request: UIMethodName) {
  const uiManager = new ThreeIDManagerUI(uiProvider)
  uiManager.promptMigrationFail()
  // switch (request) {
  //   case 'prompt_account':
  //     // uiManager.promptAccount()
  //     uiManager.promptMigrationFail()
  //     console.log('yo')
  //     break;
  //   default:
  //     console.log('no matching request')
  // }
}