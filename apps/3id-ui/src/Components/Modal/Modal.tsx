import React from 'react'

import './Modal.scss'

import Header from '../Header/Header'
import Content from '../Content/Content'
import type { DID } from 'dids'

type ModalProps = {
  request: {
    type: string
    did?: DID
    legacyDid?: DID
    message?: any
  }
  buttons: {
    acceptNode: JSX.Element
    declineNode: JSX.Element
    closeNode: JSX.Element
  }
}

// TODO: Implement Error component

export const Modal = ({ request, buttons }: ModalProps) => {
  const permissions = ['Store data', 'Read data']

  const type = request.type
  const { acceptNode, declineNode, closeNode } = buttons

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

  const formatDid = (did: any) => {
    return `${did.slice(0, 10)}…${did.slice(-5)}`
  }

  // TODO: get Logo from Sena
  const handleModal = (): JSX.Element => {
    let body: JSX.Element
    if (type === 'authenticate') {
      body = (
        <>
          <div>
            <a href={document.referrer} target="_blank" rel="noopener noreferrer">
              {document.referrer}
            </a>{' '}
            is requesting permission to connect to your decentralized identity.
            {permissionDisplay}
          </div>
          <div className="bottom">{acceptNode}</div>
        </>
      )
    } else if (type === 'account') {
      body = (
        <>
          <div>
            <br />
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
      let formattedDid = ''
      if (request.did) {
        formattedDid = formatDid(request.did)
      } else if (request.legacyDid) {
        formattedDid = formatDid(request.legacyDid)
      }
      body = (
        <>
          <div>
            <br />
            Your 3Box DID <code>{formattedDid}</code> will be migrated.
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
    } else if (type === 'inform_error') {
      body = (
        <>
          <div>
            The following error has occured while we were processing your request:
            <br />
            {request.message}
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
      <Header closeButton={closeNode} did={request.did || request.legacyDid} />
      <Content message={handleModal()} />
    </div>
  )
}

export default Modal
