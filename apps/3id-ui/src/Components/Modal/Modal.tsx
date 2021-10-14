import React from 'react'

import { IDX } from '@ceramicstudio/idx'

import './Modal.scss'

import Header from '../Header/Header'
import Content from '../Content/Content'

type ModalProps = {
  request: {
    type: string
    did?: string
    legacyDid?: string
    message?: any
  }
  buttons: {
    acceptNode: JSX.Element
    declineNode: JSX.Element
    closeNode: JSX.Element
  }
  connectService: any
}

// @ts-ignore
export const Modal = ({ request, buttons, connectService }: ModalProps) => {
  const permissions = ['Store data', 'Read data']

  const type = request.type
  const { acceptNode, declineNode, closeNode } = buttons
  const test = async () => {
    const idx = connectService.idx
    const ceramic = connectService.ceramic
    console.log('CERAMIC INSTANCE: ', ceramic)
    const fileTest = await TileDocument.load(
      ceramic,
      'kjzl6cwe1jw14ayoqla4qy0h72p3o257jk14xik53uhq08oipqckvkuvavf3pi6'
    )
    console.log('tile doc test:', fileTest)
    //@ts-ignore
    connectService.idx = new IDX({ ceramic })
    console.log(idx)
    try {
      await idx.get(
        'basicProfile',
        'did:3:bafyreihq3gquqeuzblcpckqoanlftg7zp3wivkvg26mzfiwvau45rrepie'
      )
    } catch (e) {
      console.error(e)
    }
  }

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

  const updateDisplay = async () => {
    // if ((idx && request.legacyDid) || request.did) {
    // console.log('updateDisplay :', await idx.get('basicProfile', request.did || request.legacyDid))
    // }
  }

  React.useEffect(() => {
    test()
  }, [request.did || request.legacyDid])

  const handleModal = (): JSX.Element => {
    let body: JSX.Element
    if (type === 'authenticate') {
      body = (
        <>
          <div>
            This site is requesting permission to connect to your decentralized identity.
            {permissionDisplay}
          </div>
          <div className="bottom">{acceptNode}</div>
        </>
      )
    } else if (type === 'account') {
      body = (
        <>
          <div>
            This site is requesting permission to interact with your decentralized ID. Please
            connect your wallet.
            {permissionDisplay}
          </div>
          <div className="bottom">
            {acceptNode}
            {declineNode}
          </div>
        </>
      )
    } else if (type === 'migration') {
      body = (
        <>
          <div>
            {`Your 3Box DID will be migrated.`}
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
    } else if (type === 'migration_fail') {
      body = (
        <>
          <div>
            Your 3Box account could not be migrated, continue with a new account?
            <br />
            <br />
            <a
              href="https://developers.ceramic.network/authentication/legacy/3id-connect-migration"
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
    <div
      className="modal"
      style={{
        zIndex: 9999999, //todo: pull this from request object passed in.
      }}>
      <Header closeButton={closeNode} did={request.did || request.legacyDid} type={request.type} />
      <Content message={handleModal()} />
    </div>
  )
}

export default Modal
