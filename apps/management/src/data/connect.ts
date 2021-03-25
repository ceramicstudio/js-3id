import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import { createPostMessageObserver } from '@ceramicnetwork/transport-postmessage'
import type { PostMessageTarget } from '@ceramicnetwork/transport-postmessage'
import { AuthProviderClient } from '@3id/iframe-auth-provider'
import { Manager } from '@3id/manager'

import type { RemoteProxy } from '../types'

import { ceramic } from './ceramic'

const observer = createPostMessageObserver(window.parent, '*')
export function notify(msg: string, data?: any) {
  observer.next({ ns: '3id-connect-management', msg, data })
}

export function notifyDone() {
  notify('done')
}

export function getManager(provider: any): Manager {
  const authProvider = new EthereumAuthProvider(provider, provider.selectedAddress)
  return new Manager(authProvider, { ceramic })
}

export function createRemoteProxy(target: PostMessageTarget): RemoteProxy {
  const provider = new AuthProviderClient(target)
  const manager = new Manager(provider, { ceramic })
  return { manager, provider }
}

export const remoteProxy = createRemoteProxy(window.parent)
