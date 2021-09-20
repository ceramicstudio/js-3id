import * as assets from './assets/assets'
import template from './html/template'
import { ConnectService } from './connectService'
import { UIProvider, UIProviderHandlers } from '@3id/ui-provider'
import { DisplayConnectClientRPC } from '@3id/connect-display'

/**
 *  UI Window Functions
 */

const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
const checkIsMobile = () => mobileRegex.test(navigator.userAgent)

const error = (error) => `
  <p class='walletSelect_error'>${error}</p>
`

// Given a request will render UI module templates
const render = async (params, type) => {
  const request = Object.assign({}, params, { type })
  document.getElementById('root').innerHTML = template({ request }, checkIsMobile())
}

/**
 *  Identity Wallet Service configuration and start
 */

const connectService = new ConnectService()
const iframeDisplay = new DisplayConnectClientRPC(window.parent)

const modalView = async (params, type) => {
  await iframeDisplay.display(checkIsMobile())
  await render(params, type)
  const acceptNode = document.getElementById('accept')
  const declineNode = document.getElementById('decline')

  const accepted = new Promise((resolve) => {
    acceptNode.addEventListener('click', () => {
      resolve(true)
    })
    if (declineNode) {
      declineNode.addEventListener('click', () => {
        resolve(false)
      })
    }
  })
  return {
    accepted,
    acceptNode,
    declineNode
  }
}

const UIMethods: UIProviderHandlers = {
  prompt_migration: async (ctx={}, params) => {
    const modal = await modalView(params, 'migration')
    modal.acceptNode.addEventListener('click', () => {
      modal.acceptNode.innerHTML = `Migrating ${assets.Loading}`
    })
    const migration = await modal.accepted
    return { migration }
  },
  prompt_migration_skip: async (ctx={}, params)  => {
    const modal = await modalView(params, 'migration_skip')
    modal.acceptNode.addEventListener('click', () => {
      modal.acceptNode.innerHTML = `Creating account ${assets.Loading}`
    })
    const skip = await modal.accepted
    return { skip }
  },
  prompt_migration_fail: async (ctx={}, params)  => {
    const modal = await modalView(params, 'migration_fail')
    modal.acceptNode.addEventListener('click', () => {
      modal.acceptNode.innerHTML = `Creating account ${assets.Loading}`
    })
    const createNew = await modal.accepted
    return { createNew }
  },
  prompt_account: async (ctx={}, params)  => {
    const modal = await modalView(params, 'account')
    modal.declineNode.addEventListener('click', () => {
      modal.declineNode.innerHTML = `Creating account ${assets.Loading}`
      modal.declineNode.style.boxShadow = 'none'
    })
    const createNew = !(await modal.accepted)
    return { createNew }
  },
  prompt_authenticate: async (ctx={}, params)  => {
    const modal = await modalView(params, 'authenticate')
    modal.acceptNode.addEventListener('click', () => {
      modal.acceptNode.innerHTML = `Continue ${assets.Loading}`
    })
    const allow = await modal.accepted
    return { allow }
  },
  inform_error: async (ctx={}, params)  => {
    if (params.data) {
      console.log(params.data.toString())
    }
    document.getElementById('action').innerHTML = error('Error: Unable to connect')
  }, 
  inform_close: async (ctx={}, params)  => {
    await iframeDisplay.hide()
  }
}

//Create a 3ID Connect UI Provider 
const provider = new UIProvider(UIMethods)

// Closure to pass cancel state to IDW iframe service, TODO
let closecallback

// @ts-ignore
window.hideIframe = () => {
  iframeDisplay.hide()
  const root = document.getElementById('root')
  if (root) root.innerHTML = ``
  if (closecallback) closecallback()
}

const closing = (cb) => {
  closecallback = cb
}

connectService.start(provider, closing)

// For testing, uncomment one line to see static view
// render(JSON.parse(`{"type":"authenticate","origin":"localhost:30001","paths":[], "opts": { "address": "0x9acb0539f2ea0c258ac43620dd03ef01f676a69b"}, "did":"did:3:bafyreihacllrcwagdqv7xn6yzw2xdy6wh2r6vsymbrd66vnh2o32dxpc6u"}`))
// render(JSON.parse(`{"type":"account","origin":"localhost:30001"}`))

