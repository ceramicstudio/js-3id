import React from 'react'
import './App.css'

type AppProps = {
  buttons?: any
}

function App({ buttons }: AppProps) {
  return <div className="App">{buttons.acceptNode}</div>
}

export default App
