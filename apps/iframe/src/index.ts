import * as assets from './assets/assets'
import template from './html/template'

import { ConnectService } from './connectService'
import type { UserRequestHandler } from './types'

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
      resolve(true)
    })
    if (req.type === 'account') {
      decline.addEventListener('click', () => {
        decline.innerHTML = `Creating account ${assets.Loading}`
        decline.style.boxShadow = 'none'
        resolve(false)
      })
    }
    if (req.type === 'migration') {
      accept.addEventListener('click', () => {
        accept.innerHTML = `Migrating ${assets.Loading}`
      })
    }
    if (req.type === 'authenticate') {
      accept.addEventListener('click', () => {
        accept.innerHTML = `Continue ${assets.Loading}`
      })
    }
    if (req.type === 'migration_fail' || req.type === 'migration_skip') {
      accept.addEventListener('click', () => {
        accept.innerHTML = `Creating account ${assets.Loading}`
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
// render(JSON.parse(`{"type":"authenticate","origin":"localhost:30001","paths":[], "opts": { "address": "0x9acb0539f2ea0c258ac43620dd03ef01f676a69b"}, "did":"did:3:bafyreihacllrcwagdqv7xn6yzw2xdy6wh2r6vsymbrd66vnh2o32dxpc6u"}`))
// render(JSON.parse(`{"type":"account","origin":"localhost:30001"}`))

