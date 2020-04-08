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


const consentKey = (address, domain, space) => `3id_consent_${address}_${domain}_${space}`
const serializedKey = (address) => `serialized3id_${address}`

class IdentityWalletService {
  constructor () {
    this._registerDisplayListeners()
  }

  _registerDisplayListeners () {
    this.display = caller('display', {postMessage: window.parent.postMessage.bind(window.parent)})
    this.hide = caller('hide', {postMessage: window.parent.postMessage.bind(window.parent)})
  }

  async externalAuth({ address, spaces, type }) {
    let threeId
  	if (type === '3id_auth') {
      // TODO IMPLEMENT full migration
  	} else if (type === '3id_migration') {
  		// if (!spaces) { // or will be flag
      // TODO IMPELEMENT full migration
  		// }
      // throw new Error('FAILED')

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
    store.remove('error') //TODO move, so specific to iframe implementation
    return this.hide()
  }

  _removeConsents(message, domain) {
    const spaces = [...message.params.spaces]
    const rootKeys = store.get(serializedKey(message.params.address))
    //TODO current root 'space', name
    if (!rootKeys) spaces.push('undefined')
    spaces.forEach(space => {
      const key = consentKey(message.params.address, domain, space)
      console.log(key)
      store.remove(key)
    })
  }

  async connect(address, domain) {
    const providerName = store.get(`provider_${address}`)
    if (!providerName) throw new Error('Must select provider')
    this.externalProvider = await this.web3Modal.connectTo(providerName)
  }

  // TODO could consume web3modal or
  start(web3Modal, getConsent, errorCb, cancel) {
    this.cancel = cancel
    this.web3Modal = web3Modal
    this.errorCb = errorCb
    this.idWallet = new IdentityWallet(getConsent, { externalAuth: this.externalAuth.bind(this) })
    this.provider = this.idWallet.get3idProvider()
    expose('send', this.providerRelay.bind(this), {postMessage: window.parent.postMessage.bind(window.parent)})
  }

  async providerRelay(message) {
    const domain = new Url(document.referrer).hostname
    let loop = true

    const responsePromise = new Promise(async (resolve, reject) => {
      // Register request cancel calback
      // TODO could make all rpc errors match spec
      this.cancel(()=> {
        const res = {
          'id': message.id,
          'json-rpc': '2.0',
          error: "3id-connect: Request not authorized"
        }
        resolve(res)
        loop = false
      })

      if (message.method === '3id_authenticate') {
        // Try until response valid, or canceled above
        while (loop) {
          try {
            const res = await this.provider.send(message, domain)
            if (message.method === `3id_authenticate`) this.hideIframe()
            resolve(res)
            loop = false
          } catch (e) {
            this.errorCb(e, 'Try again. Use the same account you used for this app.')
            this._removeConsents(message, domain)
          }
        }
      } else {
        const res = await this.provider.send(message, domain)
        resolve(res)
      }
    })

    return JSON.stringify(await responsePromise)
  }
}

export default IdentityWalletService
