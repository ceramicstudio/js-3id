import React, { useState } from 'react'
// @ts-ignore
import * as hexToRgb from 'hex-to-rgb'

import { ConnectService } from '../../services/connectService'
import { UIProvider } from '@3id/ui-provider'
import type { UIProviderHandlers } from '@3id/ui-provider'

import './App.scss'
import Modal from '../Modal/Modal'

const App = () => {
  const [renderType, setRenderType] = useState('')
  const [uiRequest, setUiRequest] = useState({})
  const [permission, setPermission]: any = useState(null)

  const connectService = new ConnectService()

  const hexToRBGA = (hex: string, opacity?: number | null): string =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    `rgba(${hexToRgb(hex) as string}, ${(opacity || 75) / 100})`

  /**
   *  Identity Wallet Service configuration and start
   */

  const accepted: Promise<boolean> = new Promise((resolve) => {
    return resolve(permission)
  })

  const preUi = (req: object, type: string) => {
    setRenderType(type)
    setPermission(null)
    setUiRequest(req)
  }

  const UIMethods: UIProviderHandlers = {
    prompt_migration: async (_ctx = {}, params) => {
      preUi(Object.assign({}, params), 'migration')
      const migration = await accepted
      return { migration }
    },
    prompt_migration_skip: async (_ctx = {}, params) => {
      preUi(Object.assign({}, params), 'migration_skip')
      const skip = await accepted
      return { skip }
    },
    prompt_migration_fail: async (_ctx = {}, params) => {
      preUi(Object.assign({}, params), 'migration_fail')
      const createNew = await accepted

      return { createNew }
    },
    prompt_account: async (_ctx = {}, params) => {
      preUi(Object.assign({}, params), 'account')
      const createNew = !(await accepted)

      return { createNew }
    },
    prompt_authenticate: async (_ctx = {}, params) => {
      preUi(Object.assign({}, params), 'authenticate')
      const allow = await accepted
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

  const setApproval = (result: boolean) => {
    setPermission(result)
  }

  return (
    <div
      className="App"
      // TODO: Dynamically set code instead of hardcoding
      style={{ backgroundColor: hexToRBGA('#e4e4e4') }}>
      <Modal
        type={renderType}
        acceptPermissions={(result: boolean) => {
          setApproval(result)
        }}
        uiRequest={uiRequest}
      />
    </div>
  )
}

export default App
