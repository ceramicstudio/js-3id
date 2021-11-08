import React from 'react'
import { useAtom } from 'jotai'
import type { Atom } from 'jotai'

import { UIState, AcceptState } from '../../State'

import { ButtonType } from '../../Types'
import './Button.scss'
type ButtonProps = {
<<<<<<< HEAD
  state: Atom<ButtonType>
}

const Button = ({ state }: ButtonProps) => {
  const [buttonState, setButtonState] = useAtom(state)
  const [uiState] = useAtom(UIState)
=======
  btnFunction: Function
  store: Store
}

const Button = ({ btnFunction, store }: ButtonProps) => {
  const [isLoading, setLoading] = React.useState(false)
  const [body, setBody] = React.useState('')
>>>>>>> feat/3id-ui-polish

  let localStore = store.get()
  React.useEffect(() => {
<<<<<<< HEAD
    console.log('Initial State: ', buttonState)
  }, [])

  const clickFunction = () => {
    //@ts-ignore
    setButtonState({
      ...buttonState,
      loading: true,
      body: '',
    })
    console.log('Updated State: ', buttonState)
    if (buttonState.resolve !== undefined) {
      return buttonState.resolve
    } else if (uiState.deferredPromise) {
      return uiState.deferredPromise.resolve(true)
    } else {
      return () => {}
    }
  }

  return (
    <button
      disabled={buttonState.loading === true ? true : false}
      className={`btn ${buttonState.class || 'primary'}`}
      onClick={() => {
        clickFunction()
=======
    localStore = store.get()
    console.log(localStore)
    setLoading(localStore.loading)
    setBody(localStore.body)
  })

  return (
    <button
      disabled={isLoading === true ? true : false}
      className={`btn ${localStore.class || 'primary'}`}
      onClick={() => {
        store.set({
          loading: true,
        })
        setLoading(true)
        {
          localStore.click ? localStore.click() : btnFunction()
        }
        // btnFunction()
>>>>>>> feat/3id-ui-polish
      }}>
      {buttonState.loading === true ? <div className="loader"></div> : undefined} {buttonState.body}
    </button>
  )
}

export default Button
