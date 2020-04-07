import { expose, caller } from 'postmsg-rpc'
import { fakeIpfs } from '../../identity-wallet-js/lib/utils.js'
// import { fakeIpfs } from 'identity-wallet/lib/utils'
const IdentityWallet = require('../../identity-wallet-js/lib/identity-wallet.js')
// const IdentityWallet = require('identity-wallet')
const ThreeId = require('../../3box-js/lib/3id/index.js')
// const ThreeId = require('3box/lib/3id/index')
import { createLink } from '3id-blockchain-utils'
const Url = require('url-parse')
const store = require('store')

class IdentityWalletService {
  constructor () {
    this.display = caller('display', {postMessage: window.parent.postMessage.bind(window.parent)})
    this.hide = caller('hide', {postMessage: window.parent.postMessage.bind(window.parent)})
  }

  async externalAuth({ address, spaces, type }) {
    let threeId
  	if (type === '3id_auth') {
  		// request signature with new 3ID auth message
  		// verify that signature was made from "address"
  		// return signature
      // return seed
      // TODO IMPLEMENT full migration
  	} else if (type === '3id_migration') {
  		// if (!spaces) {
  		// 	// we want to make a full migration
  		// 	// spaces = // get all spaces the user has from the 3box list spaces api
      // TODO IMPELEMENT full migration
  		// }



      threeId = await this.getThreeId(address)
      if (spaces.length > 0) {
        await threeId.authenticate(spaces)
      }
      return threeId.serializeState()
  	} else if (type === '3id_createLink' ) {
      return this.idWallet.linkAddress(address, this.externalProvider)
    }
  }

  async getThreeId (address) {
    if (!this.externalProvider) await this.connect(address)
    if(!this._threeId) {
      this._threeId = await ThreeId.getIdFromEthAddress(address, this.externalProvider, fakeIpfs, undefined, {})
    }
    return this._threeId
  }

  async displayIframe() {
    return this.display()
  }

  async hideIframe() {
    return this.hide()
  }

  async connect(address, domain) {
    const providerName = store.get(`provider_${address}`)
    if (!providerName) throw new Error('Must select provider')
    this.externalProvider = await this.web3Modal.connectTo(providerName)
  }

  // TODO seperate start connect, throw ops, take web3modal or provider here
  start(getConsent, web3Modal) {
    this.web3Modal = web3Modal
    this.idWallet = new IdentityWallet(getConsent, { externalAuth: this.externalAuth.bind(this) })
    this.provider = this.idWallet.get3idProvider()
    expose('send', this.providerRelay.bind(this), {postMessage: window.parent.postMessage.bind(window.parent)})
  }

  async providerRelay(message) {
    const domain = new Url(document.referrer).hostname
    const res = await this.provider.send(message, domain)
    if (message.method === `3id_authenticate`) this.hideIframe()
    return JSON.stringify(res)
  }
}

export default IdentityWalletService
