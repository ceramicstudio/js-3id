import React from 'react'
// TODO: implement data attribute.
export const Content = (message: string) => (
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
