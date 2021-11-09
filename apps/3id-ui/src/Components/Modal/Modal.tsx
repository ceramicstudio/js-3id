import React from 'react'
import { useAtom } from 'jotai'

import './Modal.scss'

import Header from '../Header/Header'
import Content from '../Content/Content'
import Button from '../Button/Button'

import { didShorten, urlToHost } from '../../utils'
import { ButtonsType, ConnectServiceType, RequestType } from '../../Types'

export const Modal = () => {
  const [uiDetails] = useAtom(UIState)

  const permissions = ['Store data', 'Read data']

  const type = uiDetails.params.type

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
            {uiDetails?.params?.paths === undefined || uiDetails.params.paths.length === 0
              ? ''
              : `and ${uiDetails.params.paths.length} data source ${
                  uiDetails.params.paths.length > 1 ? 's.' : '.'
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
            <Button state={AcceptState} />
            <Button state={AcceptState} />
          </div>
        </>
      )
    } else if (type === 'migration') {
      let formattedDid = ''
      if (uiDetails?.params?.did) {
        formattedDid = didShorten(uiDetails.params.did)
      } else if (uiDetails?.params?.legacyDid) {
        formattedDid = didShorten(uiDetails.params.legacyDid)
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
        did={uiDetails?.params?.did || uiDetails?.params?.legacyDid}
        type={uiDetails.params.type}
        // closeButton={uiDetails.closeNode}
      />
      <Content message={handleModal()} />
    </div>
  )
}

export default Modal
