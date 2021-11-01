import React from 'react'

import { ThreeIDService } from '@3id/service'
import { DisplayConnectClientRPC } from '@3id/connect-display'
import { UIProvider, UIProviderHandlers } from '@3id/ui-provider'
import { RPCErrorObject } from 'rpc-utils'
import { useAtom } from 'jotai'

import { CERAMIC_URL } from '../../contants'
import { AcceptState, DeclineState, UIState } from '../../State'
import { deferred } from '../../utils'
import Modal from '../Modal/Modal'

const EventProvider = () => {
  const connectService = new ThreeIDService()
  const iframeDisplay = new DisplayConnectClientRPC(window.parent)

  const [uiState, setUIState] = useAtom(UIState)
  const [acceptState, setAcceptState] = useAtom(AcceptState)
  const [declineState, setDeclineState] = useAtom(DeclineState)

  const closeButton = (
    <div
      className="close-btn"
      onClick={() => {
        iframeDisplay.hide()
      }}>
      X
    </div>
  )

  const buildParams = (params: object, type: string) => {
    iframeDisplay.display(undefined, '100%', '100%')
    return Object.assign(params, { type })
  }

  const UIMethods: UIProviderHandlers = {
    prompt_migration: async (_ctx = {}, params: object) => {
      const promise = deferred<any>()
      setUIState({
        closeNode: closeButton,
        params: buildParams(params, 'migration'),
        deferredPromise: promise,
      })
      setAcceptState({
        loading: false,
        body: 'Accept',
        class: 'primary',
      })
      const migration = await promise
      return { migration }
    },
    prompt_migration_skip: async (_ctx = {}, params: object) => {
      const promise = deferred<any>()
      setUIState({
        closeNode: closeButton,
        params: buildParams(params, 'migration_skip'),
        deferredPromise: promise,
      })
      setAcceptState({
        loading: false,
        body: 'Accept',
        class: 'primary',
      })
      const skip = await promise
      return { skip }
    },
    prompt_migration_fail: async (_ctx = {}, params: object) => {
      const promise = deferred<any>()
      setUIState({
        closeNode: closeButton,
        params: buildParams(params, 'migration_fail'),
        deferredPromise: promise,
      })
      setAcceptState({
        loading: false,
        body: 'Accept',
        class: 'primary',
      })
      const createNew = await promise
      return { createNew }
    },
    prompt_account: async (_ctx = {}, params: object) => {
      const promise = deferred<any>()
      setUIState({
        closeNode: closeButton,
        params: buildParams(params, 'account'),
        deferredPromise: promise,
      })
      setAcceptState({
        loading: false,
        body: 'Accept',
        class: 'primary',
      })
      const createNew = !(await promise)
      return { createNew }
    },
    prompt_authenticate: async (_ctx = {}, params: object) => {
      const promise = deferred<any>()
      setUIState({
        closeNode: closeButton,
        params: buildParams(params, 'authenticate'),
        deferredPromise: promise,
      })
      setAcceptState({
        loading: false,
        body: 'Accept',
        class: 'primary',
      })
      const allow = await promise
      return { allow }
    },
    inform_error: async (_ctx = {}, params: RPCErrorObject) => {
      setUIState({
        closeNode: closeButton,
        params: buildParams(params, 'inform_error'),
      })
      setAcceptState({
        loading: false,
        body: 'Close',
        class: 'primary',
      })
      return null
    },
    inform_close: async () => {
      await iframeDisplay.hide()
      return null
    },
  }

  // Closure to pass cancel state to IDW iframe service
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let closecallback: any

  const closing = (cb: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    closecallback = cb
  }

  React.useEffect(() => {
    //Create a 3ID Connect UI Provider
    const provider = new UIProvider(UIMethods)

    // connectService.start(provider, closing, 'https://ceramic-clay.3boxlabs.com')
    connectService.start(provider, closing, CERAMIC_URL)
  }, [])

  return (
    <div>
      {/* @ts-ignore - this is weird & needs to be fixed. */}
      <Modal state={uiState} />
    </div>
  )
}

export default EventProvider
