import React from 'react'
import './App.scss'
import Modal from '../Modal/Modal'

import * as hexToRgb from 'hex-to-rgb'

type AppProps = {
  buttons: any
  request: any
  connectService?: any
}

const hexToRGBA = (hex: string, opacity?: number | null): string =>
  `rgba(${hexToRgb(hex) as string}, ${(opacity || 30) / 100})`

const App = ({ buttons, request, connectService }: AppProps) => {
  return (
    <div className="App" style={{ backgroundColor: `${hexToRGBA('#e4e4e4')}` }}>
      <Modal buttons={buttons} request={request} connectService={connectService} />
    </div>
  )
}

export default App
