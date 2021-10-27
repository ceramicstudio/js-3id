import React from 'react'
import type { Store } from '../../Types'

import './Button.scss'
type ButtonProps = {
  btnFunction: Function
  store: Store
}

const Button = ({ btnFunction, store }: ButtonProps) => {
  const [isLoading, setLoading] = React.useState(false)
  const [body, setBody] = React.useState('')

  let localStore = store.get()
  React.useEffect(() => {
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
      }}>
      {isLoading === true ? <div className="loader"></div> : ''} {body}
    </button>
  )
}

export default Button
