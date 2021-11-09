import { CERAMIC_URL } from '../constants'
import { ThreeIDService } from '@3id/service'
import { DisplayConnectClientRPC } from '@3id/connect-display'
import { MigrationParams, MigrationRes, UIProvider, UIProviderHandlers, ThreeIDManagerUI, AuthParams, MigrationSkipRes, MigrationFailRes, AccountRes, AuthRes  } from '@3id/ui-provider'
import {
  RPCErrorObject,
  RPCError
} from 'rpc-utils'
import { deferred } from '../utils'
import { ServiceState } from './state'
import { useAtom, SetStateAction } from 'jotai'
import { loadProfile } from '../data/idx'
import type { DIDsData, RequestState, Response } from '../types'

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

    // TODO close on any cancellation

    //Create a 3ID Connect UI Provider
    return new UIProvider(UIMethods)
}