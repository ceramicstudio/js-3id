import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './Components/App/App'
import reportWebVitals from './reportWebVitals'
import { ConnectService } from './services/connectService'
import { UIProvider, UIProviderHandlers } from '@3id/ui-provider'

const render = async (params: object, type: string, buttons: object) => {
  console.log(buttons)
  console.log('render: ', type)
  const request = Object.assign({}, params, { type })
  ReactDOM.render(
    <React.StrictMode>
      <App request={request} buttons={buttons} />
    </React.StrictMode>,
    document.getElementById('root')
  )
}

const connectService = new ConnectService()

const modalView = async (params: object, type: string) => {
  await connectService.displayIframe()
  let acceptNode = <div className="btn">accept</div>
  // let declineNode = <div className = "btn">decline</div>

  const accepted = new Promise((resolve) => {
    // acceptNode?.addEventListener('click', () => {
    //   resolve(true)
    // })
    acceptNode = (
      <div
        className="btn"
        onClick={() => {
          resolve(true)
        }}>
        accept
      </div>
    )
    // if (declineNode) {
    //   resolve(false)
    // }
  })
  await render(params, type, { acceptNode /*, declineNode*/ })
  return {
    accepted,
    acceptNode,
    // declineNode,
  }
}

const UIMethods: UIProviderHandlers = {
  //@ts-ignore
  prompt_migration: async (ctx = {}, params: object) => {
    const modal = await modalView(params, 'migration')
    //@ts-ignore
    // modal.acceptNode.addEventListener('click', () => {
    //   //@ts-ignore
    //   modal.acceptNode.innerHTML = `Migrating`
    // })
    const migration = await modal.accepted
    console.log(migration)
    return { migration }
  },
  //@ts-ignore
  prompt_migration_skip: async (ctx = {}, params: object) => {
    const modal = await modalView(params, 'migration_skip')
    //@ts-ignore
    modal.acceptNode.addEventListener('click', () => {
      //@ts-ignore
      modal.acceptNode.innerHTML = `Creating account `
    })
    const skip = await modal.accepted
    return { skip }
  },
  //@ts-ignore
  prompt_migration_fail: async (ctx = {}, params: object) => {
    const modal = await modalView(params, 'migration_fail')
    //@ts-ignore
    modal.acceptNode.addEventListener('click', () => {
      //@ts-ignore
      modal.acceptNode.innerHTML = `Creating account `
    })
    const createNew = await modal.accepted
    return { createNew }
  },
  //@ts-ignore
  prompt_account: async (ctx = {}, params: object) => {
    const modal = await modalView(params, 'account')
    // modal.declineNode.addEventListener('click', () => {
    //   modal.declineNode.innerHTML = `Creating account `
    //   modal.declineNode.style.boxShadow = 'none'
    // })
    const createNew = !(await modal.accepted)
    return { createNew }
  },
  //@ts-ignore
  prompt_authenticate: async (ctx = {}, params: object) => {
    const modal = await modalView(params, 'authenticate')
    //@ts-ignore
    // modal.acceptNode.addEventListener('click', () => {
    //   //@ts-ignore
    //   modal.acceptNode.innerHTML = `Continue `
    // })
    const allow = await modal.accepted
    console.log(allow)
    return { allow }
  },
  // inform_error: async (ctx = {}, params: object) => {
  //   if (params.data) {
  //     console.log(params.data.toString())
  //   }
  //   document.getElementById('action').innerHTML = error('Error: Unable to connect')
  // },
}

//Create a 3ID Connect UI Provider
const provider = new UIProvider(UIMethods)

// Closure to pass cancel state to IDW iframe service, TODO
let closecallback: any

// @ts-ignore
window.hideIframe = () => {
  connectService.hideIframe()
  const root = document.getElementById('root')
  if (root) root.innerHTML = ``
  if (closecallback) closecallback()
}

const closing = (cb: any) => {
  closecallback = cb
}

connectService.start(provider, closing)

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// )

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
