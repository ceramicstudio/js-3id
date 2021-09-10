import React, { useState } from 'react'
// @ts-ignore
import * as hexToRgb from 'hex-to-rgb'

import { ConnectService } from '../../services/connectService'
import { UIProvider } from '@3id/ui-provider'
import type { UIProviderHandlers } from '@3id/ui-provider'

import './App.scss'
import Modal from '../Modal/Modal'

type AppProps = {
  // renderType?: string
  // bkgColor?: string
  // acceptFunction: any
  // declineFunction: any
}

const App = () => {
  const [renderFunctions, setRenderFunctions] = useState({
    backgroundColor: '#e4e4e4',
    type: '',
    accept: () => {},
    decline: () => {},
  })

  const hexToRBGA = (hex: string, opacity?: number | null): string =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    `rgba(${hexToRgb(hex) as string}, ${(opacity || 75) / 100})`

  //@ts-ignore
  const render = async (params: object, type: string, functions: { accept: any; decline: any }) => {
    const request = Object.assign({}, params, { type })
    const bkgColor = '#e4e4e4'

    setRenderFunctions({
      backgroundColor: bkgColor,
      type: type,
      accept: functions.accept,
      decline: functions.decline,
    })
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
    //@ts-ignore
    prompt_migration: async (_ctx = {}, params) => {
      const modal = await modalView(params, 'migration')
      const migration = await modal

      return { migration }
    },
    //@ts-ignore
    prompt_migration_skip: async (_ctx = {}, params) => {
      const modal = await modalView(params, 'migration_skip')
      const skip = await modal

      return { skip }
    },
    //@ts-ignore
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
    //@ts-ignore
    prompt_authenticate: async (_ctx = {}, params) => {
      const modal = await modalView(params, 'migration_fail')
      const allow = await modal

      return { allow }
    },
    //@ts-ignore
    inform_error: async (_ctx = {}, params) => {
      // TODO: error component here
      // if (params.data) {
      //   console.log(params.data.toString())
      // }
      // document.getElementById('action').innerHTML = error('Error: Unable to connect')
    },
  }

  // Closure to pass cancel state to IDW iframe service, TODO
  let closecallback: any

  //Create a 3ID Connect UI Provider
  const provider = new UIProvider(UIMethods)

  const closing = (cb: any) => {
    closecallback = cb
  }

  connectService.start(provider, closing)

  return (
    <div
      className="App"
      style={{ backgroundColor: hexToRBGA(renderFunctions?.backgroundColor || '#e4e4e4') }}>
      <Modal type={renderFunctions.type} />
    </div>
  )
}

export default App
