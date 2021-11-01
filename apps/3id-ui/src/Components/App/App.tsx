import React from 'react'
import * as hexToRgb from 'hex-to-rgb'

import { Provider } from 'jotai'

import './App.scss'
import EventProvider from '../EventProvider/EventProvider'

const hexToRGBA = (hex: string, opacity?: number | null): string =>
  `rgba(${hexToRgb(hex) as string}, ${(opacity || 30) / 100})`

const App = () => {
  return (
    <div className="App" style={{ backgroundColor: `${hexToRGBA('#e4e4e4')}` }}>
      <Provider>
        <EventProvider />
      </Provider>
    </div>
  )
}

export default App
