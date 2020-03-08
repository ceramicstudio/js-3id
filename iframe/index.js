const requestTemplate = require('./html.js').default
const IdentityWalletService = require('../src/IdentityWalletService.js').default

const idwService = new IdentityWalletService()

const viewUpdate = (request) => {
  root.innerHTML = requestTemplate({request})
}
// TODO for testing view
// root.innerHTML = requestTemplate({request: JSON.parse(`{"type":"authenticate","origin":"localhost","spaces":["metamask", "3box", "things"]}`)})

// metamask as provider for now
window.ethereum.enable().then(addresses => {})

// hook into consent ui
const getConsent = async (req) => {
  await idwService.displayIframe()
  viewUpdate(req)

  const result = await new Promise((resolve, reject) => {
    accept.addEventListener('click', () => { resolve(true) })
    decline.addEventListener('click', () => { resolve(false )})
  })

  await idwService.hideIframe()
  return result
}

idwService.start(getConsent, window.ethereum)
