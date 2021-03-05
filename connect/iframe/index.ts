import ConnectService from '../src/connectService'
import type { UserRequestHandler } from '../src/types'

import * as assets from './assets/assets'
import template from './html/template'

// import ConnectLegacyService from './../src/connectLegacyService.js'
// const store = require('store')

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
  document.getElementById('root').innerHTML = template({ request }, checkIsMobile())
}

/**
 *  Identity Wallet Service configuration and start
 */

//  TODO RUN BOTH SERVICES HERE
// const connectService = new ThreeIdConnectService()
const connectService = new ConnectService()

// IDW getConsent function. Consume IDW request, renders request to user, and resolve selection
const requestHandler: UserRequestHandler = async (req) => {
  await connectService.displayIframe()
  // @ts-ignore
  if (req.spaces) req.paths = req.spaces
  await render(req)
  const accept = document.getElementById('accept')
  const decline = document.getElementById('decline')

  const result: boolean = await new Promise((resolve) => {
    accept.addEventListener('click', () => {
      accept.innerHTML = `Confirm in your wallet ${assets.Loading}`
      accept.style.boxShadow = 'none'
      resolve(true)
    })
    if (req.type === 'account') {
      decline.addEventListener('click', () => {
        resolve(false)
      })
    }
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

// @ts-ignore
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
