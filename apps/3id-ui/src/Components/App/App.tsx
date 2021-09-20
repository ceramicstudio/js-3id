import React from 'react'
import './App.css'

import { ConnectService } from '../../services/connectService'

import { UIProvider } from '@3id/ui-provider'
import type { UIProviderHandlers } from '@3id/ui-provider'

type AppProps = {
  request?: object
  buttons?: any
}
//@ts-ignore
function App({ request, buttons }: AppProps) {
  console.log('buttons', buttons?.acceptNode)
  // const [acceptConnection, setAcceptConnection]: any = React.useState()
  // /**
  //  * Connect methods
  //  */
  // const connectService = new ConnectService()

  // const render = async (params: object, type: string) => {
  //   const request = Object.assign({}, params, { type })
  // }

  // const modalView = async (params: object, type: string) => {
  //   await connectService.displayIframe()
  //   await render(params, type)
  // }

  // const returnAcceptConnection = (): Promise<boolean> => {
  //   return new Promise((resolve) => resolve(acceptConnection))
  // }

  // const UIMethods: UIProviderHandlers = {
  //   //@ts-ignore
  //   prompt_migration: async (_ctx = {}, params) => {
  //     // this is not _just_ displaying the iframe, this also opens up the RPC connection

  //     //@ts-ignore
  //     await connectService.displayIframe(returnAcceptConnection)
  //     return { acceptConnection }
  //   },
  //   //@ts-ignore
  //   prompt_migration_skip: async (_ctx = {}, params) => {
  //     //@ts-ignore
  //     await connectService.displayIframe(returnAcceptConnection)
  //     return { acceptConnection }
  //   },
  //   //@ts-ignore
  //   prompt_migration_fail: async (_ctx = {}, params) => {
  //     //@ts-ignore
  //     await connectService.displayIframe(returnAcceptConnection)
  //     return { acceptConnection }
  //   },
  //   //@ts-ignore
  //   prompt_account: async (_ctx = {}, params) => {
  //     //@ts-ignore
  //     await connectService.displayIframe(returnAcceptConnection)
  //     return { acceptConnection }
  //   },
  //   //@ts-ignore
  //   prompt_authenticate: async (_ctx = {}, params) => {
  //     //@ts-ignore
  //     await connectService.displayIframe(returnAcceptConnection)
  //     return { acceptConnection }
  //   },
  //   //@ts-ignore
  //   inform_error: async (_ctx = {}, params) => {
  //     console.log(params)
  //     // TODO: error component here
  //     // if (params.data) {
  //     //   console.log(params.data.toString())
  //     // }
  //     // document.getElementById('action').innerHTML = error('Error: Unable to connect')
  //   },
  // }

  // const provider = new UIProvider(UIMethods)
  // let closecallback
  // const closing = (cb: any) => {
  //   closecallback = cb
  // }

  // React.useEffect(() => {
  //   connectService.start(provider, closing)
  // }, [])

  // const accepted = (value: boolean) => {
  //   setAcceptConnection(value)
  // }

  return (
    <div className="App">
      {buttons.acceptNode}
      {/* <div
        className="btn"
        onClick={() => {
          console.log('accept button')
        }}>
        Accept
      </div> */}
    </div>
  )
}

export default App
