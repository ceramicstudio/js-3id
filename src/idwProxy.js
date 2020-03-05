import { caller } from 'postmsg-rpc'


class ThreeIdProviderProxy {
  constructor (postMessage) {
    this.postMessage = postMessage
    this.is3idProvider = true
  }

  async send (req, origin, callback) {
    if (typeof origin === 'function') {
      callback = origin
      origin = null
    }
    const send = caller('send', {postMessage: this.postMessage})
    const res = await send(req)
    console.log(res)
    // TODO
    callback(undefined, JSON.parse(res))
    return JSON.parse(res)
  }
}

export default ThreeIdProviderProxy
