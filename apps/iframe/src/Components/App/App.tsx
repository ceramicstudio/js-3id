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
  const [renderFunctions, setRenderFunctions] = useState({
    backgroundColor: '#e4e4e4',
    type: '',
  })

  //@ts-ignore
  const [approvalResult, setApprovalResult]: null | boolean = useState(null)

  const hexToRBGA = (hex: string, opacity?: number | null): string =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    `rgba(${hexToRgb(hex) as string}, ${(opacity || 75) / 100})`

  /**
   *  Identity Wallet Service configuration and start
   */

  // This passes all the way down to Content.
  const setApproval = (result: boolean) => {
    setApprovalResult(result)
  }

  const connectService = new ConnectService()

  // Set up for @zfer
  const UIMethods: UIProviderHandlers = {
    // @ts-ignore TODO: swap this around a tad
    prompt_migration: async (_ctx = {}, _params) => {
      setRenderType('migration')
      const result = await approvalResult
      return result
    },
    // @ts-ignore
    prompt_migration_skip: async (_ctx = {}, _params) => {
      setRenderType('migration_skip')
      const result = await approvalResult
      return result
    },
    // @ts-ignore
    prompt_migration_fail: async (_ctx = {}, _params) => {
      setRenderType('migration_fail')
      const result = await approvalResult
      return result
    },
    // @ts-ignore
    prompt_account: async (_ctx = {}, _params) => {
      setRenderType('account')
      const result = await approvalResult
      return result
    },
    // @ts-ignore
    prompt_authenticate: async (_ctx = {}, _params) => {
      setRenderType('authenticate')
      const result = await approvalResult
      return result
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
      // TODO: Dynamically set code instead of hardcoding
      style={{ backgroundColor: hexToRBGA('#e4e4e4') }}>
      <Modal
        type={renderType}
        accepted={(result: boolean) => {
          setApproval(result)
        }}
      />
    </div>
  )
}

export default App
