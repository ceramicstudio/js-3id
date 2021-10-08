import React from 'react'

type ContentProps = {
  message: JSX.Element
}

export const Content = ({ message }: ContentProps) => (
  <div className="body">
    <div className="inner">{message}</div>
  </div>
)

export default Content
