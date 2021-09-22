import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './Components/App/App'
import reportWebVitals from './reportWebVitals'
import { ConnectService } from './services/connectService'

import { DisplayConnectClientRPC } from '@3id/connect-display'
import { ThreeIDService } from '@3id/service'
import { UIProvider, UIProviderHandlers } from '@3id/ui-provider'

const render = async (params: object, type: string, buttons: object) => {
  const request = Object.assign(params, { type })
  console.log(params)
  ReactDOM.render(
    <React.StrictMode>
      <App request={request} buttons={buttons} />
    </React.StrictMode>,
    document.getElementById('root')
  )
}

const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
const checkIsMobile = () => mobileRegex.test(navigator.userAgent)

const connectService = new ThreeIDService()
const iframeDisplay = new DisplayConnectClientRPC(window.parent)

const modalView = async (params: object, type: string) => {
  await iframeDisplay.display(checkIsMobile())
  let acceptNode = <div className="btn">Accept</div>
  let declineNode = <div className="btn">Decline</div>

  const accepted = new Promise((resolve) => {
    acceptNode = (
      <div
        className="btn"
        onClick={() => {
          resolve(true)
        }}>
        Accept
      </div>
    )
    if (declineNode) {
      declineNode = (
        <div
          className="btn"
          onClick={() => {
            resolve(true)
          }}>
          Decline
        </div>
      )
    }
  })
  await render(params, type, { acceptNode, declineNode })
  return {
    accepted,
    acceptNode,
    declineNode,
  }
}

const UIMethods: UIProviderHandlers = {
  //@ts-ignore
  prompt_migration: async (ctx = {}, params: object) => {
    const modal = await modalView(params, 'migration')
    const migration = await modal.accepted
    console.log(migration)
    return { migration }
  },
  //@ts-ignore
  prompt_migration_skip: async (ctx = {}, params: object) => {
    const modal = await modalView(params, 'migration_skip')
    const skip = await modal.accepted
    return { skip }
  },
  //@ts-ignore
  prompt_migration_fail: async (ctx = {}, params: object) => {
    const modal = await modalView(params, 'migration_fail')
    const createNew = await modal.accepted
    return { createNew }
  },
  //@ts-ignore
  prompt_account: async (ctx = {}, params: object) => {
    const modal = await modalView(params, 'account')
    const createNew = !(await modal.accepted)
    return { createNew }
  },
  //@ts-ignore
  prompt_authenticate: async (ctx = {}, params: object) => {
    const modal = await modalView(params, 'authenticate')
    const allow = await modal.accepted
    console.log(allow)
    return { allow }
  },
  // // TODO: reenable this
  // inform_error: async (ctx = {}, params: object) => {
  //   if (params.data) {
  //     console.log(params.data.toString())
  //   }
  //   document.getElementById('action').innerHTML = error('Error: Unable to connect')
  // },
}

//Create a 3ID Connect UI Provider
const provider = new UIProvider(UIMethods)

// Closure to pass cancel state to IDW iframe service
let closecallback: any

// @ts-ignore
window.hideIframe = () => {
  iframeDisplay.hide()
  const root = document.getElementById('root')
  if (root) root.innerHTML = ``
  if (closecallback) closecallback()
}

const closing = (cb: any) => {
  closecallback = cb
}

//@ts-ignore
connectService.start(provider, closing)

reportWebVitals()
