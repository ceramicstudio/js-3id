import React from 'react'
import ReactDOM from 'react-dom'

import './index.css'
import App from './Components/App/App'
import reportWebVitals from './reportWebVitals'

import { ThreeIDService } from '@3id/service'
import { DisplayConnectClientRPC } from '@3id/connect-display'
import { UIProvider, UIProviderHandlers } from '@3id/ui-provider'
import { RPCErrorObject } from 'rpc-utils'

const render = async (params: object, type: string, buttons: object) => {
  const request = Object.assign(params, { type })
  console.log(params)
  ReactDOM.render(
    <React.StrictMode>
      <App request={request} buttons={buttons} connectService={connectService} />
    </React.StrictMode>,
    document.getElementById('root')
  )
}

const connectService = new ThreeIDService()
const iframeDisplay = new DisplayConnectClientRPC(window.parent)

type ModalType = {
  accepted: Promise<boolean>
  acceptNode: JSX.Element
  declineNode: JSX.Element
}

const modalView = async (params: object, type: string): Promise<ModalType> => {
  await iframeDisplay.display(undefined, '100%', '100%')
  const closeNode = (
    <div
      className="close-btn"
      onClick={() => {
        iframeDisplay.hide()
      }}>
      X
    </div>
  )
  let acceptNode = <div className="btn">Accept</div>
  let declineNode = <div className="btn">Decline</div>

  const accepted: Promise<boolean> = new Promise((resolve) => {
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
            resolve(false)
          }}>
          Decline
        </div>
      )
    }
  })
  await render(params, type, { acceptNode, declineNode, closeNode })
  return {
    accepted,
    acceptNode,
    declineNode,
  }
}

const UIMethods: UIProviderHandlers = {
  prompt_migration: async (_ctx = {}, params: object) => {
    const modal = await modalView(params, 'migration')
    const migration = await modal.accepted
    return { migration }
  },
  prompt_migration_skip: async (_ctx = {}, params: object) => {
    const modal = await modalView(params, 'migration_skip')
    const skip = await modal.accepted
    return { skip }
  },
  prompt_migration_fail: async (_ctx = {}, params: object) => {
    const modal = await modalView(params, 'migration_fail')
    const createNew = await modal.accepted
    return { createNew }
  },
  prompt_account: async (_ctx = {}, params: object) => {
    const modal = await modalView(params, 'account')
    const createNew = !(await modal.accepted)
    return { createNew }
  },
  prompt_authenticate: async (_ctx = {}, params: object) => {
    const modal = await modalView(params, 'authenticate')
    const allow = await modal.accepted
    return { allow }
  },
  inform_error: async (_ctx = {}, params: RPCErrorObject) => {
    await modalView(params, 'inform_error')
    return null
  },
  inform_close: async () => {
    // await iframeDisplay.hide()
    return null
  },
}

//Create a 3ID Connect UI Provider
const provider = new UIProvider(UIMethods)

// Closure to pass cancel state to IDW iframe service
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let closecallback: any

const closing = (cb: any) => {
  closecallback = cb
}

connectService.start(provider, closing, CERAMIC_URL)

reportWebVitals()
