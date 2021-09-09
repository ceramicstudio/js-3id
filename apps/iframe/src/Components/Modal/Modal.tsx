import React, { useState, useEffect } from 'react'

import './Modal.scss'

import Header from '../Header/Header'
import Content from '../Content/Content'

// const didShorten = (did: string): string => `${did.substring(0, 10)}...${did.substring(did.length - 5, did.length)}`

type ModalProps = {
  type?: string
}

// TODO: Implement Error component

export const Modal = ({ type }: ModalProps) => {
  const [modal, setModal] = useState(
    <div>
      Your 3Box Account could not be migrated, continue with a new account?
      <br />
      <br />
      <a
        href="developers.ceramic.network/authentication/legacy/3id-connect-migration"
        rel="noopener noreferrer"
        target="_blank">
        Learn More
      </a>
    </div>
  )

  const [permissions, _setPermissions] = useState(['Store data', 'Read data'])

  const [permissionDisplay] = useState(
    <div className="permissions">
      {permissions.map((permission, _id) => {
        return (
          <div className="permission" key={_id}>
            <span className="permission-note"></span>
            {permission}
          </div>
        )
      })}
    </div>
  )

  // TODO: get Logo from Sena=
  const handleModal = (): JSX.Element => {
    let body: JSX.Element
    if (type === 'authenticate') {
      body = (
        <div>
          This site is requesting permission to connect to your decentralized identity.
          {permissionDisplay}
        </div>
      )
    } else if (type === 'account') {
      body = (
        <div>
          This site is requesting permission to interact with your decentralized ID. Please connect
          your wallet.
          {permissionDisplay}
        </div>
      )
    } else if (type === 'migration') {
      body = (
        <div>
          Your 3Box Account could not be migrated, continue with a new account?
          <br />
          <br />
          <a
            href="developers.ceramic.network/authentication/legacy/3id-connect-migration"
            rel="noopener noreferrer"
            target="_blank">
            Learn More
          </a>
        </div>
      )
    } else {
      body = <div>Detecting Request Type...</div>
    }
    return body
  }

  useEffect(() => {
    setModal(handleModal())
  }, [])

  return (
    <div className="modal">
      <Header />
      <Content message={modal} />
    </div>
  )
}

export default Modal
