import React from 'react'
import ReactDOM from 'react-dom'
import { ConnectService } from './services/connectService'
import { UIProvider } from '@3id/ui-provider'
//@ts-ignore
import * as hexToRgb from 'hex-to-rgb'

import './index.css'
import App from './Components/App/App'
// TODO: readd this here
// import reportWebVitals from './reportWebVitals'

import type { UIProviderHandlers } from '@3id/ui-provider'

/**
 *  UI Window Functions
 */

const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
const checkIsMobile = () => mobileRegex.test(navigator.userAgent)

const error = (error: any) => `
  <p class='walletSelect_error'>${error}</p>
`

// Given a request will render UI module templates
const render = async (params: object, type: string, functions: { accept: any; decline: any }) => {
  const request = Object.assign({}, params, { type })

  // TODO:

  //TODO: parse through data object to get colors
  ReactDOM.render(
    <React.StrictMode>
      <App
        renderType={render}
        bkgColor={hexToRBGA('#000000', 10)}
        acceptFunction={functions.accept}
        declineFunction={functions.decline}
      />
    </React.StrictMode>,
    document.getElementById('root')
  )

  // document.getElementById('root').innerHTML = template({ request }, checkIsMobile())
}

/**
 *  Identity Wallet Service configuration and start
 */

const connectService = new ConnectService()

const modalView = async (params: object, type: string) => {
  await connectService.displayIframe()

  //TODO: pass these functions into render function
  const accepted = new Promise((resolve) => {
    const accept = () => {
      resolve(true)
    }

    const decline = () => {
      resolve(false)
    }
    render(params, type, { accept, decline })
  })

  return await accepted
}

const UIMethods: UIProviderHandlers = {
  prompt_migration: async (_ctx = {}, params) => {
    const modal = await modalView(params, 'migration')
    const migration = await modal

    return { migration }
  },
  prompt_migration_skip: async (_ctx = {}, params) => {
    const modal = await modalView(params, 'migration_skip')
    const skip = await modal

    return { skip }
  },
  prompt_migration_fail: async (_ctx = {}, params) => {
    const modal = await modalView(params, 'migration_fail')
    const createNew = await modal

    return { createNew }
  },
  prompt_account: async (_ctx = {}, params) => {
    const modal = await modalView(params, 'account')
    const createNew = await !modal

    return { createNew }
  },
  prompt_authenticate: async (_ctx = {}, params) => {
    const modal = await modalView(params, 'migration_fail')
    const allow = await modal

    return { allow }
  },
  inform_error: async (_ctx = {}, params) => {
    // TODO: error component here
    // if (params.data) {
    //   console.log(params.data.toString())
    // }
    // document.getElementById('action').innerHTML = error('Error: Unable to connect')
  },
}

//Create a 3ID Connect UI Provider
const provider = new UIProvider(UIMethods)

// Closure to pass cancel state to IDW iframe service, TODO
let closecallback: any

// @ts-ignore
window.hideIframe = () => {
  connectService.hideIframe()
  const root = document.getElementById('root')
  if (root) root.innerHTML = ``
  if (closecallback) closecallback()
}

const closing = (cb: any) => {
  closecallback = cb
}

connectService.start(provider, closing)

const hexToRBGA = (hex: string, opacity?: number | null): string =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  `rgba(${hexToRgb(hex) as string}, ${(opacity || 75) / 100})`

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals()
