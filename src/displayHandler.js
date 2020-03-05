import { expose } from 'postmsg-rpc'

class DisplayHandler {
  constructor (postMessage, displayFunc, hideFunc) {
    // this.postMessage = postMessage
    // this.is3idProvider = true
    this.displayFunc = displayFunc
    this.hideFunc = hideFunc

    expose('display', displayFunc, {postMessage})
    expose('hide', hideFunc, {postMessage})
  }

  display() {
    this.displayFunc()
  }

  hide() {
    this.hideFunc()
  }
}

export default DisplayHandler
