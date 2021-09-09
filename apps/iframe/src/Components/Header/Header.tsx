import React, { useState } from 'react'

import Avatar from 'boring-avatars'

import './Header.scss'

/**
 * Handle all the data updates that are needed for display.
 */
export const Header = () => {
  const [user] = useState({})
  // Get the Favicon of the parent window
  // const referrerUrl =
  //   window.location != window.parent.location ? document.referrer : document.location.href
  // Fetch the page & snag the favicon

  const did = undefined // user?.id // TODO: Set based off of IDX DID
  const [avatar, setAvatar] = useState(
    <Avatar
      size={65}
      name={did ?? 'self.id-connect'}
      variant="marble"
      colors={['#FF0092', '#FFCA1B', '#B6FF00', '#228DFF', '#BA01FF']}
    />
  )
  return (
    <div className="head">
      <div className="logo-container">
        <a
          href="https://ceramic.network"
          rel="noopener noreferrer"
          target="_blank"
          className="logo col-12">
          SelfId Connect
        </a>
        <span> SelfID Connect </span>
      </div>
      <div className="image-container">
        <div className="avatar">{avatar}</div>
      </div>
    </div>
  )
}

export default Header
