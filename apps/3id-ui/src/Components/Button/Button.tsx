import React from 'react'
import { useAtom } from 'jotai'
import type { Atom } from 'jotai'

import { UIState, AcceptState } from '../../State'

import { ButtonType } from '../../Types'
import './Button.scss'
type ButtonProps = {
  state: Atom<ButtonType>
}

const Button = ({ state }: ButtonProps) => {
  const [buttonState, setButtonState] = useAtom(state)
  const [uiState] = useAtom(UIState)

  React.useEffect(() => {
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
      }}>
      {buttonState.loading === true ? <div className="loader"></div> : undefined} {buttonState.body}
    </button>
  )
}

export default Button
