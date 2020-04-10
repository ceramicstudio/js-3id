const requestCard = require('./html/3IDConnect/requestCard.js').default
const ThreeIdConnectService = require('./../src/threeIdConnectService.js').default
const web3Modal = require('./provider').default
const store = require('store')

const assets = require('./html/3IDConnect/assets/assets.js')
const style = require('style-loader!./style.scss')

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

window.providerNameFunc = (provider, address, displayName) => {
  selectedWallet.innerHTML = displayName
  chosenWallet.innerHTML = assets[displayName];

  store.set(`provider_${address}`, provider)
  store.set(`providerName_${address}`, displayName)
}

window.getProviderDisplayImage = (address) => {
  const imageToRender = store.get(`providerName_${address}`);
  const image = imageToRender ? assets[imageToRender] : assets.Wallet;
  return image;
}

window.getProviderDisplayName = (address) => {
  return store.get(`providerName_${address}`)
}

window.getProvider = (address) => {
  return store.get(`provider_${address}`)
}

window.handleBrokenImage = (image) => {
  image.onerror = "";
  document.getElementById("siteFavicon").style.display = 'none';
}

const checkIsMobile = () => {
  let isMobile;
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    isMobile = true;
  } else {
    isMobile = false;
  }
  console.log('isMobile', isMobile)
  return isMobile;
};

// Given a request will render UI module templates
const render = async (request) => {
  const errorMessage = store.get('error')
  let data = {
    request
  }
  if (errorMessage) data.error = errorMessage
  if (request.type === 'authenticate' && request.spaces.length === 0) data.request.spaces = ['3Box']
  root.innerHTML = requestCard(data, checkIsMobile())
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
      accept.innerHTML = `Approve in wallet ${assets.Loading}`;
      document.getElementById("accept").style.opacity = .5;
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

const closing = (cb) => {
  closecallback = cb
}

idwService.start(web3Modal, getConsent, errorCb, closing)

// For testing, uncomment one line to see static view
render(JSON.parse(`{"type":"authenticate","origin":"localhost:30001","spaces":["metamask", "3Box", "thingspace"], "opts": { "address": "0x9acb0539f2ea0c258ac43620dd03ef01f676a69b"}}`))