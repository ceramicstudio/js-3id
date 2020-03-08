import { expose, caller } from 'postmsg-rpc'
import { fakeIpfs } from '../../identity-wallet-js/lib/utils.js'
const IdentityWallet = require('../../identity-wallet-js/lib/identity-wallet.js')
const ThreeId = require('../../3box-js/lib/3id/index.js')

class IdentityWalletService {
  constructor () {
    this.display = caller('display', {postMessage: window.parent.postMessage.bind(window.parent)})
    this.hide = caller('hide', {postMessage: window.parent.postMessage.bind(window.parent)})
  }

  async externalAuth({ address, spaces, type }) {
    let threeId
    console.log(type)
  	if (type === '3id-auth') {
  		// request signature with new 3ID auth message
  		// verify that signature was made from "address"
  		// return signature
      return seed
  	} else if (type === '3id_migration') {
  		// if (!spaces) {
  		// 	// we want to make a full migration
  		// 	// spaces = // get all spaces the user has from the 3box list spaces api
  		// }
      // TODO verify that signature from same address
      threeId = await ThreeId.getIdFromEthAddress(address, this.externalProvider, fakeIpfs, undefined, {})

      if (spaces.length > 0) {
        await threeId.authenticate(spaces)
      }

      return threeId.serializeState()
  	}
  }

  async displayIframe() {
    return this.display()
  }

  async hideIframe() {
    return this.hide()
  }

  start(getConsent, externalProvider) {
    this.externalProvider = externalProvider
    const idWallet = new IdentityWallet(getConsent, { externalAuth: this.externalAuth.bind(this) })
    this.provider = idWallet.get3idProvider()
    expose('send', this.providerRelay.bind(this), {postMessage: window.parent.postMessage.bind(window.parent)})
  }

  async providerRelay(message) {
    // TOOD origin
    const res = await this.provider.send(message, 'localhost')
    return JSON.stringify(res)
  }
}

export default IdentityWalletService
