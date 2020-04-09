const requestCard = require('./html/3IDConnect/requestCard.js').default
const ThreeIdConnectService = require('./../src/threeIdConnectService.js').default
const web3Modal = require('./provider').default
const store = require('store')

store.remove('error')

/**
 *  UI Window Functions
 */
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

window.providerNameFunc = (provider, address) => {
  selectedWallet.innerHTML = provider
  store.set(`provider_${address}`, provider)
}

window.getProvider = (address) => {
 return store.get(`provider_${address}`)
}

// Given a request will render UI module templates
const render = async (request) => {
  const errorMessage = store.get('error')
  let data = {
    request
  }
  if (errorMessage) data.error = errorMessage
  if (request.type === 'authenticate' && request.spaces.length === 0) data.request.spaces = ['3Box']
  root.innerHTML = requestCard(data)
}

/**
 *  Identity Wallet Service configuration and start
 */

const idwService = new ThreeIdConnectService()

// IDW getConsent function. Consume IDW request, renders request to user, and resolve selection
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

  return result
}

// Service calls on error, renders error to UI
const errorCb = (err, msg) => {
  if (!msg) msg = err.toString()
  if (err.toString().includes('Must select provider')) msg = 'Must select a wallet to continue.'
  console.log(err)
  store.set('error', msg)
}

// Closure to pass cancel state to IDW iframe service
let closecallback

window.hideIframe = () => {
  idwService.hideIframe()
  if (closecallback) closecallback()
}

const closing = (cb) => { closecallback = cb }

idwService.start(web3Modal, getConsent, errorCb, closing)

// For testing, uncomment one line to see static view
render(JSON.parse(`{"type":"authenticate","origin":"dashboard.3box.io","spaces":["metamask", "3Box", "thingspace"], "opts": { "address": "0x9acb0539f2ea0c258ac43620dd03ef01f676a69b"}}`))
