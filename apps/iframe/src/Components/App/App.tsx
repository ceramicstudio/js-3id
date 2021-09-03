import React from 'react'
import './App.scss'
import Modal from '../Modal/Modal'

type AppProps = {
  renderType?: string
  bkgColor?: string //TODO: set regex for this
}

const App = ({ renderType, bkgColor }: AppProps) => {
  return (
    <div className="App" style={{ backgroundColor: bkgColor || '#e4e4e4' }}>
      <Modal type={renderType} />
    </div>
  )
}

export default App
