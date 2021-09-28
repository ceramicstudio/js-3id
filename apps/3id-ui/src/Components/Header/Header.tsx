import React from 'react'

import Avatar from 'boring-avatars'

import './Header.scss'

type HeaderProps = {
  closeButton: JSX.Element
}

export const Header = ({ closeButton }: HeaderProps) => {
  return (
    <div className="head">
      <div className="close-container">{closeButton}</div>
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
        <div className="avatar">
          <Avatar
            size={65}
            name="self.id-connect"
            variant="marble"
            colors={['#FF0092', '#FFCA1B', '#B6FF00', '#228DFF', '#BA01FF']}
          />
        </div>
      </div>
    </div>
  )
}

export default Header
