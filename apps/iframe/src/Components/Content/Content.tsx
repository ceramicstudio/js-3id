import React from 'react'

type ContentProps = {
  message: JSX.Element
  acceptPermissions: any
}

export const Content = ({ message, acceptPermissions }: ContentProps) => (
  <div className="body">
    <div className="inner">
      {message}
      <div className="bottom">
        <a
          className="btn"
          onClick={() => {
            acceptPermissions(true)
          }}>
          Continue
        </a>

        {/* TODO: decline button */}
      </div>
    </div>
  </div>
)

export default Content
