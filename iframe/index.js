const requestTemplate = require('./html/request.js').default
const providerTemplate = require('./html/providerSelect.js').default
const IdentityWalletService = require('../src/IdentityWalletService.js').default
const web3Modal = require('./provider').default

const viewUpdate = (request) => {
  root.innerHTML = requestTemplate({request})
}

const renderProviderSelect = (request) => {
  root.innerHTML = providerTemplate()
}


const providerNameFuncWrap = cb => str => {
  cb(str)
}

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

const selectProvider = async () => {

  const result = new Promise((resolve, reject) => {
    window.providerNameFunc = providerNameFuncWrap(resolve)
  })

  await idwService.displayIframe()
  console.log('select provdier!')
  renderProviderSelect()

  await result

  // TODO get consent may not always follow, need better iframe control
  // await idwService.hideIframe()
  return result
}

const idwService = new IdentityWalletService()
idwService.start(getConsent, selectProvider, web3Modal)
