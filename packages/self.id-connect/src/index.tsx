import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import Modal from './Components/Modal/Modal'
// TODO: readd this here
// import reportWebVitals from './reportWebVitals'

import { ConnectService } from './services/connectService'
import { RenderTypes, UserRequestHandler, UserRequestCancel } from './types'

/**
 * UI Window Functions
 */

// TODO: error rendering

const connectService = new ConnectService()

let render: RenderTypes

const requestHandler: UserRequestHandler = async (req) => {
  await connectService.displayIframe()

  if (req.spaces) req.paths = req.spaces
  // await render(req) // TODO: remove me
  // const accept = document.getElementById('accept')
  // const decline = document.getElementById('decline')

  const result: boolean = await new Promise((resolve) => {
    // accept.addEventListener('click', () => {
    //   resolve(true)
    // })
    resolve(true)
    if (req.type === 'account') {
      render = 'account'
      // decline.addEventListener('click', () => {
      //   decline.innerHTML = `Creating account`
      //   decline.style.boxShadow = 'none'
      //   resolve(false)
      // })
    }
    if (req.type === 'migration') {
      render = 'migration'
      // accept.addEventListener('click', () => {
      //   accept.innerHTML = `Migrating`
      // })
    }
    if (req.type === 'authenticate') {
      render = 'authenticate'
      // accept.addEventListener('click', () => {
      //   accept.innerHTML = `Continue`
      // })
    }
    if (req.type === 'migration_fail' || req.type === 'migration_skip') {
      render = 'migration_fail'
      // accept.addEventListener('click', () => {
      //   accept.innerHTML = `Creating account`
      // })
    }
  })
  return result
  // return result
}

const closing = (cb: UserRequestCancel): void => {
  closeCb = cb
}
let closeCb = closing
// TODO: sort this out
//@ts-ignore
connectService.start(requestHandler, /*errorCb,*/ closeCb)
// Debug render
ReactDOM.render(
  <React.StrictMode>
    <Modal type={render} />
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals()
