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
    if (req.method != '3id_newAuthMethodPoll' && req.method != "3id_newLinkPoll") {
      console.log('request')
      console.log(req)
    }
    const send = caller('send', {postMessage: this.postMessage})
    const res = await send(req)
    // TODO
    callback(undefined, JSON.parse(res))
    return JSON.parse(res)
  }
}

export default ThreeIdProviderProxy
