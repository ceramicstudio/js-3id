import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import { createPostMessageObserver } from '@ceramicnetwork/transport-postmessage'
import { Manager } from '@3id/did-manager'
import { AuthProviderClient } from '@3id/window-auth-provider'

import { ceramic } from '../data/ceramic'
import type { RemoteProxy } from '../types'

const observer = createPostMessageObserver(window.parent, '*')
export function notify(msg: string, data?: any) {
  observer.next({ ns: '3id-connect-management', msg, data })
}

export function notifyDone() {
  notify('done')
}

export function getManager(provider: any): Manager {
  const authProvider = new EthereumAuthProvider(provider, provider.selectedAddress)
  // @ts-ignore
  return new Manager(authProvider, { ceramic })
}

export function createRemoteProxy(target: Window): RemoteProxy {
  const provider = new AuthProviderClient(target)
  // @ts-ignore
  const manager = new Manager(provider, { ceramic })
  return { manager, provider }
}

export const remoteProxy = createRemoteProxy(window.parent)
