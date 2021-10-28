import React from 'react'

import './Modal.scss'

import Header from '../Header/Header'
import Content from '../Content/Content'

import { didShorten, urlToHost } from '../../utils'
import { ButtonsType, ConnectServiceType, RequestType } from '../../Types'

type ModalProps = {
  request: RequestType
  buttons: ButtonsType
  connectService: ConnectServiceType
}

export const Modal = ({ request, buttons, connectService }: ModalProps) => {
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

  const handleModal = (): JSX.Element => {
    let body: JSX.Element
    if (type === 'authenticate') {
      body = (
        <>
          <div>
            <a href={document.referrer} target="_blank" rel="noopener noreferrer">
              {urlToHost(document.referrer)}
            </a>{' '}
            is requesting permission to connect to your decentralized identity.{' '}
            {request.paths === undefined || request.paths.length === 0
              ? ''
              : `and ${request?.paths?.length} data source ${
                  request?.paths?.length > 1 ? 's.' : '.'
                }`}
          </div>
          {permissionDisplay}
          <div className="bottom">{acceptNode}</div>
        </>
      )
    } else if (type === 'account') {
      body = (
        <>
          <div>
            <br />
            <a href={document.referrer}>{urlToHost(document.referrer)}</a> is requesting permission
            to interact with your decentralized ID. Connect your wallet.
            {permissionDisplay}
          </div>
          <div className="bottom">
            {acceptNode}
            {declineNode}
          </div>
        </>
      )
    } else if (type === 'migration') {
      let formattedDid = ''
      if (request.did) {
        formattedDid = didShorten(request.did)
      } else if (request.legacyDid) {
        formattedDid = didShorten(request.legacyDid)
      }
      body = (
        <>
          <div>
            Your 3Box DID <code>{formattedDid}</code> will be migrated.
          </div>
          <div className="bottom">
            {acceptNode}
            {declineNode}
          </div>
        </>
      )
    } else if (type === 'migration_fail') {
      body = (
        <>
          <div>
            You have a 3Box account we are unable to migrate, continue with a new account?
            <br />
            <br />
            <a
              href="https://developers.ceramic.network/authentication/legacy/3id-connect-migration"
              rel="noopener noreferrer"
              target="_blank">
              Learn More
            </a>
          </div>
          <div className="bottom">
            {acceptNode}
            {declineNode}
          </div>
        </>
      )
    } else if (type === 'migration_skip') {
      let formattedDid = ''
      if (request.did) {
        formattedDid = didShorten(request.did)
      } else if (request.legacyDid) {
        formattedDid = didShorten(request.legacyDid)
      }
      body = (
        <>
          <div>
            Your 3Box DID {formattedDid} could not be migrated, continue with a new account?
          </div>
          <div className="bottom">
            {acceptNode}
            {declineNode}
          </div>
        </>
      )
    } else if (type === 'inform_error') {
      body = (
        <>
          <div>An error has occurred while authenticating, unable to connect</div>
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
      <Header
        closeButton={closeNode}
        did={request.did || request.legacyDid}
        type={request.type}
        connectService={connectService}
      />
      <Content message={handleModal()} />
    </div>
  )
}

export default Modal
