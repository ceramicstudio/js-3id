import React from 'react'
type ContentProps = {
  message?: JSX.Element
  approval?: any
}

export const Content = ({ message, approval }: ContentProps) => (
  <div className="body">
    <div className="inner">
      {message}
      <div className="bottom">
        <a
          className="btn"
          onClick={() => {
            approval(true)
          }}>
          Continue
        </a>
      </div>
    </div>
  </div>
)

export default Content
