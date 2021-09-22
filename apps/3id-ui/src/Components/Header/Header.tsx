import React from 'react'
import Avatar from 'boring-avatars'

import { createIdx } from '../../utils'
import './Header.scss'

type HeaderProps = {
  did?: string
}
const Header = ({ did }: HeaderProps) => {
  const idx = createIdx()

  React.useEffect(() => {
    console.log(did)
    if (did) {
      idx.get('basicProfile', did)
    }
  })
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
        <div className="avatar">
          <Avatar
            size={65}
            name={did ?? 'self.id-connect'}
            variant="marble"
            colors={['#FF0092', '#FFCA1B', '#B6FF00', '#228DFF', '#BA01FF']}
          />
        </div>
      </div>
    </div>
  )
}

export default Header
