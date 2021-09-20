import React from 'react'
import './App.css'

import { ConnectService } from '../../services/connectService'

import { UIProvider } from '@3id/ui-provider'
import type { UIProviderHandlers } from '@3id/ui-provider'

type AppProps = {
  buttons?: any
}

function App({ buttons }: AppProps) {
  return <div className="App">{buttons.acceptNode}</div>
}

export default App
