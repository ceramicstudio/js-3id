import { createPostMessageObserver, createMessageObservable } from '@ceramicnetwork/transport-postmessage'
import type { PostMessageTarget } from '@ceramicnetwork/transport-postmessage'
import {
  AuthProviderClient,
  EthereumAuthProvider,
  Manage3IDs,
} from '3id-connect'
import type { EthereumProvider } from '3id-connect'

import type { RemoteProxy } from '../types'

import { ceramic } from './ceramic'

const observer = createPostMessageObserver(window.parent, '*')
export function notify(msg: string, data?: any) {
  observer.next({ ns: '3id-connect-management', msg, data })
}

export function notifyDone() {
  notify('done')
}

export function getManager(provider: EthereumProvider): Manage3IDs {
  const authProvider = new EthereumAuthProvider(
    provider,
    (provider as any).selectedAddress,
  )
  return new Manage3IDs(authProvider, { ceramic })
}

export function createRemoteProxy(target: PostMessageTarget): RemoteProxy {
  const provider = new AuthProviderClient(target)
  const manager = new Manage3IDs(provider, { ceramic })
  return { manager, provider }
}

export const remoteProxy = createRemoteProxy(window.parent)
