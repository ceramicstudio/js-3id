import { createPostMessageTransport } from '@ceramicnetwork/transport-postmessage'
import type { PostMessageTarget } from '@ceramicnetwork/transport-postmessage'
import {
  AuthProviderClient,
  EthereumAuthProvider,
  Manage3IDs,
} from '3id-connect'
import type { EthereumProvider } from '3id-connect'

import type { RemoteProxy } from '../types'

import { ceramic } from './ceramic'

export const transport = createPostMessageTransport<string>(window, window, {
  filter: (event) => {
    return (
      typeof event.data === 'string' && event.data.startsWith('3id-connect-')
    )
  },
  postMessageArguments: ['*'],
})

export function notify(msg: string) {
  transport.next(msg)
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
