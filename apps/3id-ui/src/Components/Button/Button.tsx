import React from 'react'
import type { Store } from '../../Types'

import './Button.scss'
type ButtonProps = {
  btnType?: string
  btnFunction: Function
  store: Store
}

const Button = ({ btnType, btnFunction, store }: ButtonProps) => {
  const [isLoading, setLoading] = React.useState(false)
  const [body, setBody] = React.useState('hi')

  React.useEffect(() => {
    setLoading(store.loading)
    setBody(store.body)
  })

  return (
    <button
      disabled={isLoading === true ? true : false}
      className={`btn ${btnType || 'primary'}`}
      onClick={() => {
        store.set({
          loading: true,
        })
        setLoading(true)
        btnFunction()
      }}>
      {isLoading === true ? <div className="loader"></div> : ''} {body}
    </button>
  )
}

export default Button
