const requestCard = require('./html/3IDConnect/requestCard.js').default
const IdentityWalletService = require('./../src/identityWalletService.js').default
const web3Modal = require('./provider').default
const store = require('store')

const render = async (request) => {
  let data = {
    request
  }
  if (request.type === 'authenticate' && request.spaces.length === 0) data.request.spaces = ['3Box']
  root.innerHTML = requestCard(data)
}

 window.providerNameFunc = (provider, address) => {
    selectedWallet.innerHTML = provider
    store.set(`provider_${address}`, provider)
 }

 window.getProvider = (address) => {
   return store.get(`provider_${address}`)
 }


const getConsent = async (req) => {
  await idwService.displayIframe()
  await render(req)

  const result = await new Promise((resolve, reject) => {
    accept.addEventListener('click', () => {
      resolve(true)
    })
    decline.addEventListener('click', () => {
      resolve(false)
    })
  })

  await idwService.hideIframe()
  return result
}

// For testing, uncomment one line to see each view static
render(JSON.parse(`{"type":"authenticate","origin":"dashboard.3box.io","spaces":["metamask", "3Box", "thingspace"], "opts": { "address": "0x9acb0539f2ea0c258ac43620dd03ef01f676a69b"}}`))


const idwService = new IdentityWalletService()
window.hideIframe = idwService.hideIframe.bind(idwService)
idwService.start(getConsent, web3Modal)

window.isOpen = false;
const handleOpenWalletOptions = (isOpen) => {
  if (window.isOpen) {
    document.getElementById("walletOptions").style.display = "none";
    document.getElementById("onClickOutside").style.display = "none";
  } else {
    document.getElementById("walletOptions").style.display = "inline-grid";
    document.getElementById("onClickOutside").style.display = "flex";
  }
  window.isOpen = !window.isOpen
}
window.handleOpenWalletOptions = handleOpenWalletOptions;
