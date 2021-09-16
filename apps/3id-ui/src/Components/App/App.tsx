import React, { useEffect, useState } from 'react'
import './App.css'
import { ConnectService } from '../../services/connectService'

import { UIProvider } from '@3id/ui-provider'
import type { UIProviderHandlers } from '@3id/ui-provider'

function App() {
  //@ts-ignore
  const render = async (params: object, type: string) => {
    const result = await accepted()
    return result
  }

  /**
   * Connect methods
   */
  const connectService = new ConnectService()

  const UIMethods: UIProviderHandlers = {
    //@ts-ignore
    prompt_migration: async (_ctx = {}, params) => {
      await connectService.displayIframe()
      const accept = await render(params, 'migration')
      return { accept }
    },
    //@ts-ignore
    prompt_migration_skip: async (_ctx = {}, params) => {
      await connectService.displayIframe()
      const accept = await render(params, 'migration_skip')
      return { accept }
    },
    //@ts-ignore
    prompt_migration_fail: async (_ctx = {}, params) => {
      await connectService.displayIframe()
      const accept = await render(params, 'migration_fail')
      return { accept }
    },
    //@ts-ignore
    prompt_account: async (_ctx = {}, params) => {
      await connectService.displayIframe()
      const accept = await render(params, 'account')
      return { accept }
    },
    //@ts-ignore
    prompt_authenticate: async (_ctx = {}, params) => {
      await connectService.displayIframe()
      const accept = await render(params, 'authenticate')
      return { accept }
    },
    //@ts-ignore
    inform_error: async (_ctx = {}, params) => {
      await connectService.displayIframe()
      console.log('error')
      // TODO: error component here
      // if (params.data) {
      //   console.log(params.data.toString())
      // }
      // document.getElementById('action').innerHTML = error('Error: Unable to connect')
    },
  }

  const provider = new UIProvider(UIMethods)
  let closecallback
  const closing = (cb: any) => {
    closecallback = cb
  }
  useEffect(() => {
    connectService.start(provider, closing)
  }, [])

  const accepted = (): Promise<boolean> => {
    return Promise.resolve(true)
  }

  return (
    <div className="App">
      <div
        className="btn"
        onClick={() => {
          accepted()
        }}>
        Accept
      </div>
    </div>
  )
}

export default App
