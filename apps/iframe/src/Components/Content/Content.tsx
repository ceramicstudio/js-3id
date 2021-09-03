import React from 'react'
type ContentProps = {
  message?: JSX.Element
}

export const Content = ({ message }: ContentProps) => (
  <div className="body">
    <div className="inner">
      {message}
      <div className="bottom">
        <a className="btn">Continue</a>
      </div>
    </div>
  </div>
)

export default Content
