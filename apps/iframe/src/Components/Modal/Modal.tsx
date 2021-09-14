import React from 'react'

import './Modal.scss'

import Header from '../Header/Header'
import Content from '../Content/Content'

type ModalProps = {
  type: string
  uiRequest: Object
  acceptPermissions: any
}

// TODO: Implement Error component

export const Modal = ({ type, uiRequest, acceptPermissions }: ModalProps) => {
  // TODO: update this to be dynamically set when we have permission customization.
  const permissions = ['Store data', 'Read data']

  console.log(uiRequest)

  const permissionDisplay = (
    <div className="permissions">
      {permissions.map((permission, _id) => {
        return (
          <div className="permission" key={_id}>
            <span className="permission-note" />
            {permission}
          </div>
        )
      })}
    </div>
  )

  // TODO: get Logo from Sena
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

  return (
    <div className="modal">
      <Header />
      <Content
        message={handleModal()}
        acceptPermissions={(result: boolean) => {
          acceptPermissions(result)
        }}
      />
    </div>
  )
}

export default Modal
