import { expose, caller } from 'postmsg-rpc'
const IdentityWallet = require('identity-wallet')
const seed = '0x8C8F7aa1512db8b5150f36db0e1409749E234a2c'

window.ethereum.enable().then(addresses => {
  console.log(addresses)
})

// hook into consent ui
const getConsent = async (req) => {
  console.log('get consent!')
  const display = caller('display', {postMessage: window.parent.postMessage.bind(window.parent)})
  await display()
  console.log('consentreq')
  console.log(req)
  reqPayload.innerHTML = JSON.stringify(req)
  // return false

  const result = await new Promise((resolve, reject) => {
    accept.addEventListener('click', () => { resolve(true) })
    decline.addEventListener('click', () => { resolve(false )})
  })

  const hide = caller('hide', {postMessage: window.parent.postMessage.bind(window.parent)})
  await hide()

  return result
}

const idWallet = new IdentityWallet(getConsent, { seed })
const provider = idWallet.get3idProvider()

const connectService = {
  providerRelay: async (message) => {
    const res = await provider.send(message, 'localhost')
    return JSON.stringify(res)
  }
}

expose('send', connectService.providerRelay, {postMessage: window.parent.postMessage.bind(window.parent)})
