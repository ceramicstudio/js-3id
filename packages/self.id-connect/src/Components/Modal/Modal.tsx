import React from 'react'
import './Modal.scss'

// import Permissions from '../Permissions/Permissions' // We dont' currently need this but the basework is there.

// const didShorten = (did: string): string => `${did.substring(0, 10)}...${did.substring(did.length - 5, did.length)}`

// type ModalType = string | Record<string, never> // ensure we handle nothing being passed.
type SetHTML = {
  __html: string
}

type ModalProps = {
  type?: string
}

// TODO: Implement Error component

// TODO: implement data attribute.
// TODO: extract to independent component
const content = (message: string) =>
  `
    <div class = "body">
      <div class = "inner">
        ${message}

        <div class = "bottom">
          <a class = "btn">
            Continue
          </a>
        </div>
      </div>
    </div>
  `

export const Modal = ({ type }: ModalProps) => {
  // TODO: extract to independed component
  const head = `
    <div class = "head">
      <div class = "logo-container"> 
        <a
        href="https://ceramic.network"
        rel="noopener noreferrer"
        target="_blank"
        class="logo col-12"
        >
          SelfId Connect
        </a>
        <span> SelfID Connect </span>
      </div>
    </div>
  `

  let display: SetHTML = {
    __html: `
      ${head}
      ${content('Detecting result...')}
    `,
  }
  // TODO: get Logo from Sena
  switch (type) {
    case 'authenticate':
      display = {
        __html: `
          ${head}
          ${content(
            `
              This site is requesting permission to connect to your decentralized identity.
              <div class = "permissions">
                <ul>
                  <li>Store Data</li>
                  <li>Read Data</li>
                </ul>
              </div>
            `
          )}
        `,
      }
      break
    case 'account':
      display = {
        __html: `
          ${head}
          ${content(
            'This site is requesting permission to interact with your decentralized ID. </br> Please connect your wallet.'
          )}
        `,
      }
      break
    case 'migration':
      display = {
        __html: `
          ${head}
          ${content(
            `
              <div>
                Your 3Box Account could not be migrated, continue with a new account? 
                <br />
                <br />
                <a 
                  href = "developers.ceramic.network/authentication/legacy/3id-connect-migration" 
                  rel = "noopener noreferrer" 
                  target="_blank"
                >
                  Learn More 
                </a>
              </div>
            `
          )}
        `,
      }
      break
    default:
      display
  }

  return (
    <div className="modal">
      <div dangerouslySetInnerHTML={display}></div>
    </div>
  )
}

export default Modal
