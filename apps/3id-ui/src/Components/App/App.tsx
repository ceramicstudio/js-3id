import React from 'react'
import './App.css'

import Modal from '../Modal/Modal'

type AppProps = {
  buttons: any
  request: any
}

const App = ({ buttons, request }: AppProps) => {
  return <Modal buttons={buttons} request={request} />
}

export default App
