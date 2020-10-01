import { caller } from 'postmsg-rpc'
// import {
//   HandlerMethods,
//   RequestHandler,
//   RPCConnection,
//   RPCError,
//   RPCRequest,
//   RPCResponse,
//   createHandler,
// } from 'rpc-utils'

/**
 *  A DID provider proxy, DID provider interface that acts as rpc client, to
 *  relay request to iframe (rpc server)
 */
class DidProviderProxy {
  constructor (postMessage, accountId) {
    this.postMessage = postMessage
    this.sendRPC = caller('send', {postMessage: this.postMessage})
    this.accountId = accountId
  }

  get isDidProvider() {
    return true
  }

  async send (msg, origin) {
    msg.params = Object.assign({}, msg.params, { accountId: this.accountId })
    const res = await this.sendRPC(msg)
    return JSON.parse(res)
  }
}

export default DidProviderProxy
