import { expose, caller } from 'postmsg-rpc'
const IdentityWallet = require('../../identity-wallet-js/lib/identity-wallet.js')
const ThreeId = require('../../3box-js/lib/3id/index.js')
// const utils = require('../../identity-wallet-js/src/utils.js')
// const idwUtils = require('../../identity-wallet-js/src/utils.js')
import { fakeIpfs } from '../../identity-wallet-js/lib/utils.js'

let threeId, address

// const seed = '0x8C8F7aa1512db8b5150f36db0e1409749E234a2c'




window.ethereum.enable().then(addresses => {
  console.log(addresses)
  address = addresses[0]
  // threeId = new ThreeId(window.ethereum, fakeIpfs, undefined, {}) {
})



const externalAuth =  async ({ address, spaces, type }) => {
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
    threeId = await ThreeId.getIdFromEthAddress(address, window.ethereum, fakeIpfs, undefined, {})

    if (spaces.length > 0) {
      await threeId.authenticate(spaces)
    }

    return threeId.serializeState()
	}
}


const display = caller('display', {postMessage: window.parent.postMessage.bind(window.parent)})
const hide = caller('hide', {postMessage: window.parent.postMessage.bind(window.parent)})

// hook into consent ui
const getConsent = async (req) => {
  await display()
  reqPayload.innerHTML = JSON.stringify(req)

  const result = await new Promise((resolve, reject) => {
    accept.addEventListener('click', () => { resolve(true) })
    decline.addEventListener('click', () => { resolve(false )})
  })

  await hide()
  return result
}

const idWallet = new IdentityWallet(getConsent, { externalAuth })
const provider = idWallet.get3idProvider()

const connectService = {
  providerRelay: async (message) => {
    const res = await provider.send(message, 'localhost')
    return JSON.stringify(res)
  }
}

expose('send', connectService.providerRelay, {postMessage: window.parent.postMessage.bind(window.parent)})
