import React from 'react'
import './App.scss'
import Modal from '../Modal/Modal'

import { hexToRGBA } from '../../utils'

type AppProps = {
  buttons: any
  request: any
}

const App = ({ buttons, request }: AppProps) => {
  return (
    <div
      className="App"
      // TODO: dynamically set this based off of request object.
      style={{ backgroundColor: `${hexToRGBA('#e4e4e4')}` }}>
      <Modal buttons={buttons} request={request} />
    </div>
  )
}

export default App
