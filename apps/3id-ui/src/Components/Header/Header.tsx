import React from 'react'
import Avatar from 'boring-avatars'

import { didShorten } from '../../utils'
import './Header.scss'

type HeaderProps = {
  did?: string
  type: string
  closeButton: JSX.Element
}
const Header = ({ did, type, closeButton }: HeaderProps) => {
  const headerData = () => {
    if (type === 'authenticate') {
      if (did !== undefined) {
        return (
          <div className="details">
            <code>{didShorten(`${did}`)}</code>
          </div>
        )
      }
    } else if (type === 'account') {
      return (
        <div className="details">
          <a href="https://ceramic.network" rel="noopener noreferrer" target="_blank">
            What is this?
          </a>
        </div>
      )
    } else if (type === 'migration') {
      return (
        <div className="details">
          <a
            href="https://developers.ceramic.network/authentication/legacy/3id-connect-migration"
            rel="noopener noreferrer"
            target="_blank">
            How migration works?
          </a>
        </div>
      )
    } else {
      return <div className="details"></div>
    }
    return <div className="details"></div>
  }
  return (
    <div className="head">
      <div className="head-container">
        {headerData()}
        {closeButton}
      </div>
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
            name={did || 'self.id-connect'}
            variant="marble"
            colors={['#FF0092', '#FFCA1B', '#B6FF00', '#228DFF', '#BA01FF']}
          />
        </div>
      </div>
    </div>
  )
}

export default Header
