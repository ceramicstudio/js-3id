import React from 'react'

import Avatar from 'boring-avatars'

import { IDX } from '@ceramicstudio/idx'
import type { CeramicApi } from '@ceramicnetwork/common'

import { didShorten } from '../../utils'
import './Header.scss'
import selfIdLogo from './self.id.svg'

type HeaderProps = {
  closeButton: JSX.Element
  connectService?: any
}
const Header = ({ did, type, closeButton, connectService }: HeaderProps) => {
  const [userData, setUserData] = React.useState({
    name: undefined,
    image: undefined,
  })
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
  const setup = () => {
    if (connectService.idx) {
      return true
    }
    const ceramic: CeramicApi = connectService.ceramic
    try {
      connectService.idx = new IDX({ ceramic })
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  const updateData = async () => {
    try {
      const data = await connectService.idx.get('basicProfile', did)
      setUserData(data.content)
    } catch (e) {
      console.error(e)
    }
  }

  React.useEffect(() => {
    setup()
    if (did) {
      console.log(did)
      updateData()
    }
    console.log('userData: ', userData)
  }, [did])

  const ipfsToImg = (url: string) => {
    let formattedUrl = url.split('ipfs://')[1]
    formattedUrl = `https://ipfs.infura.io/ipfs/${formattedUrl}`
    return formattedUrl
  }

  const boringOrAvatar = () => {
    if (userData.image !== undefined) {
      return (
        <div
          className="avatarImage"
          style={{
            backgroundImage: ipfsToImg(userData.image),
          }}></div>
      )
    } else {
      return (
        <Avatar
          size={65}
          name={did || 'self.id-connect'}
          variant="marble"
          colors={['#FF0092', '#FFCA1B', '#B6FF00', '#228DFF', '#BA01FF']}
        />
      )
    }
  }

  return (
    <div className="head">
      <div className="close-container">{closeButton}</div>
      <div className="logo-container">
        <a
          href="https://ceramic.network"
          rel="noopener noreferrer"
          target="_blank"
          className="logo col-12">
          <img src={selfIdLogo} alt="self.id logo" />
        </a>
      </div>
      <div className="image-container">
        <div className="avatar">{boringOrAvatar()}</div>
      </div>
    </div>
  )
}

export default Header
