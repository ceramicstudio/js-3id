import React from 'react'

import './Modal.scss'

import Header from '../Header/Header'
import Content from '../Content/Content'

type ModalProps = {
  request: {
    type: string
    params: object
    did?: string
    legacyDid?: string
  }
  buttons: {
    acceptNode: JSX.Element
    declineNode: JSX.Element
  }
}

// TODO: Implement Error component

export const Modal = ({ request, buttons }: ModalProps) => {
  // TODO: update this to be dynamically set when we have permission customization.
  const permissions = ['Store data', 'Read data']

  const type = request.type
  const { acceptNode, declineNode } = buttons

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
        <>
          <div>
            <a href={document.referrer}>{document.referrer}</a> is requesting permission to connect
            to your decentralized identity.
            {permissionDisplay}
          </div>
          <div className="bottom">{acceptNode}</div>
        </>
      )
    } else if (type === 'account') {
      body = (
        <>
          <div>
            <a href={document.referrer}>{document.referrer}</a> is requesting permission to interact
            with your decentralized ID. Please connect your wallet.
            {permissionDisplay}
          </div>
          <div className="bottom">
            hi
            {acceptNode}
            {declineNode}
          </div>
        </>
      )
    } else if (type === 'migration') {
      body = (
        <>
          <div>
            {`Your 3Box DID ${request.did || request.legacyDid} will be migrated.`}
            <br />
            <br />
            <a
              href="developers.ceramic.network/authentication/legacy/3id-connect-migration"
              rel="noopener noreferrer"
              target="_blank">
              Learn More
            </a>
          </div>
          <div className="bottom">{acceptNode}</div>
        </>
      )
    } else {
      body = (
        <>
          <div>Detecting Request Type...</div>
          <div className="bottom"></div>
        </>
      )
    }
    return body
  }

  return (
    <div className="modal">
      <Header did={request.did || request.legacyDid} />
      <Content message={handleModal()} />
    </div>
  )
}

export default Modal
