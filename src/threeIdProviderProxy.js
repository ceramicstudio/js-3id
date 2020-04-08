import { caller } from 'postmsg-rpc'

class ThreeIdProviderProxy {
  constructor (postMessage) {
    this.postMessage = postMessage
    this.is3idProvider = true
    this.sendRPC = caller('send', {postMessage: this.postMessage})
  }

  async send (req, origin, callback) {
    if (typeof origin === 'function') {
      callback = origin
      origin = null
    }

    const res = await this.sendRPC(req)

    callback(undefined, JSON.parse(res))
    return JSON.parse(res)
  }
}

export default ThreeIdProviderProxy
