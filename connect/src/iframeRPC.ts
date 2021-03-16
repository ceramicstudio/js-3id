import { createCrossOriginClient, createCrossOriginServer } from '@ceramicnetwork/rpc-postmessage'
import type { Wrapped } from '@ceramicnetwork/transport-subject'
import { createPostMessageTransport } from '@ceramicnetwork/transport-postmessage'
import type { IncomingMessage, PostMessageTarget } from '@ceramicnetwork/transport-postmessage'
import { RPCClient } from 'rpc-utils'
import type { HandlerMethods, RPCMethods, RPCRequest, RPCResponse } from 'rpc-utils'

const transportOptions = {
  // Client requests will be sent without origin restriction
  postMessageArguments: ['*'],
}
const clientOptions = {
  // Silence warnings of invalid messages, such as message events sent by third-parties
  onInvalidInput: () => {},
}

export function createClient<Methods extends RPCMethods, Namespace extends string = string>(
  namespace: Namespace,
  target?: PostMessageTarget
): RPCClient<Methods> {
  const transport = createPostMessageTransport<
    Wrapped<RPCResponse<Methods, keyof Methods>, Namespace>,
    Wrapped<RPCRequest<Methods, keyof Methods>, Namespace>
  >(window, target ?? window.parent, transportOptions)
  return createCrossOriginClient<Methods, Namespace>(transport, namespace, clientOptions)
}

export function createServer<Methods extends RPCMethods, Namespace extends string = string>(
  namespace: Namespace,
  methods: HandlerMethods<
    IncomingMessage<Wrapped<RPCRequest<Methods, keyof Methods>, Namespace>>,
    Methods
  >
) {
  return createCrossOriginServer<Methods, Namespace>({ methods, namespace, target: window })
}
