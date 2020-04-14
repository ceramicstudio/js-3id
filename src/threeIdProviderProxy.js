import { caller } from 'postmsg-rpc'

const callbackOrThrow = (callback, errMsg) => {
  if (callback) {
    callback(errMsg)
  } else {
    throw errMsg instanceof Error ? errMsg : new Error(errMsg)
  }
}

/**
 *  A 3ID provider proxy, 3ID provider interface that acts as rpc client, to
 *  relay request to iframe (rpc server)
 */
class ThreeIdProviderProxy {
  constructor (postMessage) {
    this.postMessage = postMessage
    this.is3idProvider = true
    this.threeIdConnect = true 
    this.migration = true
    this.sendRPC = caller('send', {postMessage: this.postMessage})
  }

  async send (req, origin, callback) {
    if (typeof origin === 'function') {
      callback = origin
      origin = null
    }

    // Catches rpc errors, method errors are relayed in response for client to handle
    try {
      const res = JSON.parse(await this.sendRPC(req))
      if (callback) callback(undefined, res)
      return res
    } catch (err) {
      callbackOrThrow(callback, err)
      return
    }
  }
}

export default ThreeIdProviderProxy
