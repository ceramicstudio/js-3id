import React from 'react'
import ReactDOM from 'react-dom'

import './index.css'
import App from './Components/App/App'
import Button from './Components/Button/Button'
import reportWebVitals from './reportWebVitals'

import { CERAMIC_URL } from './contants'
import { AcceptStore, DeclineStore } from './State/Button'
import type { ButtonsType, RequestType } from './Types'
import close from './assets/close.svg'

import { ThreeIDService } from '@3id/service'
import { DisplayConnectClientRPC } from '@3id/connect-display'
import { UIProvider, UIProviderHandlers } from '@3id/ui-provider'
import { RPCErrorObject } from 'rpc-utils'

const render = async (params: object, type: string, buttons: ButtonsType) => {
  const request: RequestType = Object.assign(params, { type })
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
//@ts-ignore
const modalView = async (params: object, type: string): Promise<ModalType> => {
  await iframeDisplay.display(undefined, '100%', '100%')
  const closeNode = (
    <div
      className="close-btn"
      onClick={() => {
        iframeDisplay.hide()
      }}>
      <img src={close} />
    </div>
  )
  let acceptNode = <div className="btn"></div>
  let declineNode = <div className="btn"></div>

  const accepted: Promise<boolean> = new Promise((resolve) => {
    acceptNode = (
      <Button
        btnFunction={() => {
          resolve(true)
        }}
        store={AcceptStore}
      />
    )
    declineNode = (
      <Button
        btnFunction={() => {
          resolve(false)
        }}
        store={DeclineStore}
      />
    )
  })

  await render(params, 'account', { acceptNode, declineNode, closeNode })
  return {
    accepted,
    acceptNode,
    declineNode,
  }
}

const UIMethods: UIProviderHandlers = {
  prompt_migration: async (_ctx = {}, params: object) => {
    AcceptStore.set({
      loading: false,
      body: 'Accept',
    })
    DeclineStore.set({
      loading: false,
      body: 'Learn more',
      click: () => {
        window
          .open(
            'https://developers.ceramic.network/authentication/legacy/3id-connect-migration',
            '_blank'
          )
          ?.focus()
      },
    })
    const modal = await modalView(params, 'migration')
    const migration = await modal.accepted
    return { migration }
  },
  prompt_migration_skip: async (_ctx = {}, params: object) => {
    AcceptStore.set({
      loading: false,
      body: 'Accept',
    })
    DeclineStore.set({
      loading: false,
      body: 'Learn more',
      click: () => {
        window
          .open(
            'https://developers.ceramic.network/authentication/legacy/3id-connect-migration',
            '_blank'
          )
          ?.focus()
      },
    })
    const modal = await modalView(params, 'migration_skip')
    const skip = await modal.accepted
    return { skip }
  },
  prompt_migration_fail: async (_ctx = {}, params: object) => {
    AcceptStore.set({
      loading: false,
      body: 'Continue',
      click: () => {
        iframeDisplay.hide()
      },
    })
    DeclineStore.set({
      loading: false,
      body: 'Learn More',
      click: () => {
        window
          .open(
            'https://developers.ceramic.network/authentication/legacy/3id-connect-migration',
            '_blank'
          )
          ?.focus()
      },
    })
    const modal = await modalView(params, 'migration_fail')
    const createNew = await modal.accepted
    return { createNew }
  },
  prompt_account: async (_ctx = {}, params: object) => {
    AcceptStore.set({
      loading: false,
      body: 'Connect to Existing ID',
    })
    DeclineStore.set({
      loading: false,
      body: 'Cancel',
    })
    const modal = await modalView(params, 'account')
    const createNew = !(await modal.accepted)
    return { createNew }
  },
  prompt_authenticate: async (_ctx = {}, params: object) => {
    AcceptStore.set({
      loading: false,
      body: 'Continue',
    })
    const modal = await modalView(params, 'authenticate')
    const allow = await modal.accepted
    return { allow }
  },
  inform_error: async (_ctx = {}, params: RPCErrorObject) => {
    AcceptStore.set({
      loading: false,
      body: 'Close',
      click: () => {
        iframeDisplay.hide()
      },
    })
    await modalView(params, 'inform_error')
    return null
  },
  inform_close: async () => {
    await iframeDisplay.hide()
    return null
  },
}

//Create a 3ID Connect UI Provider
const provider = new UIProvider(UIMethods)

// Closure to pass cancel state to IDW iframe service
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let closecallback: any

const closing = (cb: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  closecallback = cb
}

// connectService.start(provider, closing, 'https://ceramic-clay.3boxlabs.com')
connectService.start(provider, closing, CERAMIC_URL)

reportWebVitals()
