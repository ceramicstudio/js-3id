import template from './html/template.js'
import ThreeIdConnectService from './../src/threeIdConnectService.js'
const store = require('store')
const assets = require('./assets/assets.js')

store.remove('error')

/**
 *  UI Window Functions
 */

window.handleBrokenImage = (image) => {
  image.onerror = "";
  document.getElementById("siteFavicon").style.display = 'none';
}

const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
const checkIsMobile = () => mobileRegex.test(navigator.userAgent)

// Given a request will render UI module templates
const render = async (request) => {
  const errorMessage = store.get('error')
  let data = {
    request
  }
  if (errorMessage) data.error = errorMessage
  if (request.type === 'authenticate' && request.spaces.length === 0) data.request.spaces = ['3Box']
  root.innerHTML = template(data, checkIsMobile())
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

idwService.start(getConsent, errorCb, closing)

// For testing, uncomment one line to see static view
// render(JSON.parse(`{"type":"authenticate","origin":"localhost:30001","spaces":["metamask", "3Box", "thingspace"], "opts": { "address": "0x9acb0539f2ea0c258ac43620dd03ef01f676a69b"}}`))
