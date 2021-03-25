import { createNamespaceClient, createNamespaceServer } from '@ceramicnetwork/rpc-postmessage'
import type { HandledPayload } from '@ceramicnetwork/rpc-postmessage'
import type { UnwrapObservableOptions, Wrapped } from '@ceramicnetwork/transport-subject'
import { createPostMessageTransport } from '@ceramicnetwork/transport-postmessage'
import type {
  IncomingMessage,
  PostMessageTarget,
  PostMessageTransportOptions,
} from '@ceramicnetwork/transport-postmessage'
import { RPCClient } from 'rpc-utils'
import type { HandlerMethods, RPCMethods, RPCRequest, RPCResponse } from 'rpc-utils'
import type { Observable } from 'rxjs'

export type ClientOptions = UnwrapObservableOptions & PostMessageTransportOptions

export type IncomingRequest<
  Methods extends RPCMethods,
  Namespace extends string = string
> = IncomingMessage<Wrapped<RPCRequest<Methods, keyof Methods>, Namespace>>

export type ServerPayload<Methods extends RPCMethods, Namespace extends string> = HandledPayload<
  IncomingRequest<Methods, Namespace>,
  Methods,
  keyof Methods
>

const DEFAULT_OPTIONS: ClientOptions = {
  onInvalidInput: (_input: unknown, _error: Error) => {
    // Silence warnings of invalid messages, such as message events sent by third-parties
  },
  // Client requests will be sent without origin restriction
  postMessageArguments: ['*'],
}

export function createClient<Methods extends RPCMethods, Namespace extends string = string>(
  namespace: Namespace,
  target: PostMessageTarget,
  options: ClientOptions = DEFAULT_OPTIONS
): RPCClient<Methods> {
  const transport = createPostMessageTransport<
    Wrapped<RPCResponse<Methods, keyof Methods>, Namespace>,
    Wrapped<RPCRequest<Methods, keyof Methods>, Namespace>
  >(window, target, options)
  return createNamespaceClient<Methods, Namespace>(transport, namespace, options)
}

export function createServer<Methods extends RPCMethods, Namespace extends string = string>(
  namespace: Namespace,
  methods: HandlerMethods<IncomingRequest<Methods, Namespace>, Methods>
): Observable<ServerPayload<Methods, Namespace>> {
  return createNamespaceServer<Methods, Namespace>({ methods, namespace, target: window })
}
