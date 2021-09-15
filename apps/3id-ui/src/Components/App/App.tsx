import React from 'react'
import './App.css'
import { ConnectService } from '../../services/connectService'

import { UIProvider } from '@3id/ui-provider'
import type { UIProviderHandlers } from '@3id/ui-provider'

function App() {
  const connectService = new ConnectService()
  connectService.displayIframe()

  const UIMethods: UIProviderHandlers = {
    //@ts-ignore
    prompt_migration: async (_ctx = {}, params) => {
      // should return { boolean }
    },
    //@ts-ignore
    prompt_migration_skip: async (_ctx = {}, params) => {
      // should return { boolean }
    },
    //@ts-ignore
    prompt_migration_fail: async (_ctx = {}, params) => {
      // should return { boolean }
    },
    //@ts-ignore
    prompt_account: async (_ctx = {}, params) => {
      // should return { boolean }
    },
    //@ts-ignore
    prompt_authenticate: async (_ctx = {}, params) => {
      // should return { boolean }
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

  const provider = new UIProvider(UIMethods)

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer">
          Learn React
        </a>
      </header>
    </div>
  )
}

export default App
