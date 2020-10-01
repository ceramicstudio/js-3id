import template from './html/template.js'
import ConnectLegacyService from './../src/connectLegacyService.js'
import ConnectService from './../src/connectService.js'
const store = require('store')
const assets = require('./assets/assets.js')

/**
 *  UI Window Functions
 */

const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
const checkIsMobile = () => mobileRegex.test(navigator.userAgent)

const error = (error) => `
  <p class='walletSelect_error'>${error}</p>
`

// Given a request will render UI module templates
const render = async (request) => {
  document.getElementById('root').innerHTML = template({request}, checkIsMobile())
}

/**
 *  Identity Wallet Service configuration and start
 */

//  TODO RUN BOTH SERVICES HERE 
// const connectService = new ThreeIdConnectService()
const connectService = new ConnectService()


// IDW getConsent function. Consume IDW request, renders request to user, and resolve selection
// TODO handle accoutn selection 
// TODODO HANDLE both paths and spaces 
const requestHandler = async (req) => {
  console.log(req)
  await connectService.displayIframe()
  await render(req)
  const accept = document.getElementById('accept')

  // TODO render legacy space reqs to another template

  const result = await new Promise((resolve, reject) => {
    accept.addEventListener('click', () => {
      accept.innerHTML = `Confirm in your wallet ${assets.Loading}`;
      accept.style.boxShadow = 'none';
      resolve(true)
    })
  })

  return result
}

// Service calls on error, renders error to UI
const errorCb = (err, msg, req) => {
  if (!msg) msg = err.toString()
  msg = 'Error: Unable to connect'
  console.log(err)
  document.getElementById('action').innerHTML = error(msg)
}

// Closure to pass cancel state to IDW iframe service
let closecallback

window.hideIframe = () => {
  connectService.hideIframe()
  const root = document.getElementById('root')
  if (root) root.innerHTML = ``
  if (closecallback) closecallback()
}

const closing = (cb) => {
  closecallback = cb
}

connectService.start(requestHandler, errorCb, closing)

// For testing, uncomment one line to see static view
// render(JSON.parse(`{"type":"authenticate","origin":"localhost:30001","spaces":["metamask", "3Box", "thingspace"], "opts": { "address": "0x9acb0539f2ea0c258ac43620dd03ef01f676a69b"}}`))
