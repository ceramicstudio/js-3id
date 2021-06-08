import * as assets from './../assets/assets'

import style from '../css/style.scss'

const didShorten = (did: string): string =>
  `${did.substring(0, 10)}...${did.substring(did.length - 5, did.length)}`

const template = (data, isMobile) => `
  <div class='${style.card} ${isMobile ? style.cardMobile : ''} ${
  isMobile && !data.error ? style.slideBottom : !data.error ? style.slideLeft : ''
}'>
    <div class=${style.controls}>
      <div class=${style.controls_logo}>
        <a
        href="https://ceramic.network"
        rel="noopener noreferrer"
        target="_blank"
        class=${style.controls_logo}
        >
          ${assets.Logo}
        </a>
        <span> 3ID Connect </span>
      </div>

      <div class='${style.headerLeft}'>
        ${header(data)}
      </div>
    </div>

    <div class='${style.content} ${isMobile ? style.contentMobile : ''}' id='content' >
      <div class='${style.header}'>
        <div class='${style.promptText}'>
          <div class='${style.subText}'>
            <p>
              ${content(data)}
            </p>
          </div>
        </div>
        <div class='${style.actions}' id='action'>
          ${actions(data)}
          ${data.error ? error(data) : ''}
        </div>
      </div>
    </div>
  </div>
`

const header = (data) => {
  if (data.request.type === 'authenticate') {
    if (data.request.did) {
      const did = data.request.did
      return didShorten(did)
    }
    return ``
  }
  if (data.request.type === 'account') {
    return `<a href="https://ceramic.network" rel="noopener noreferrer" target="_blank">
    What is this?
  </a>`
  }
  if (data.request.type === 'migration') {
    return `<a href="https://developers.ceramic.network/authentication/legacy/3id-connect-migration" rel="noopener noreferrer" target="_blank">
    How migration works?
  </a>`
  }
  return ``
}

const content = (data) => {
  if (data.request.type === 'authenticate') {
    return `This site wants to access your personal data${
      data.request.paths.length === 0 ? '' : ' and ' + data.request.paths.length + ' data source'
    }${data.request.paths.length > 1 ? 's. ' : '.'}`
  }
  if (data.request.type === 'account') {
    return `Connect your wallet to a decentralized ID.`
  }
  if (data.request.type === 'migration') {
      return `Your 3Box DID ${didShorten(data.request.legacyDid)} will be migrated.`
  }
  if (data.request.type === 'migration_fail') {
    return `Your 3Box account could not be migrated, continue with a new account?  ` + 
    `<a href="https://developers.ceramic.network/authentication/legacy/3id-connect-migration" rel="noopener noreferrer" target="_blank">
    Learn More
    </a>`
  }
  if (data.request.type === 'migration_skip') {
    return `You have a 3Box account we are unable to migrate, continue with a new account?  ` + 
    `<a href="https://developers.ceramic.network/authentication/legacy/3id-connect-migration" rel="noopener noreferrer" target="_blank">
    Learn More
    </a>`
  }
}

const actions = (data) => {
  if (
    data.request.type === 'authenticate' ||
    data.request.type === 'migration' ||
    data.request.type === 'migration_fail' ||
    data.request.type === 'migration_skip'
  ) {
    return `
      <button id='accept' class='${style.primaryButton}' ${
      data.error ? 'style="display:none;"' : ''
    } >
        Continue
      </button>
      <button id='decline' class='${style.secondaryButton}' ${
      data.error ? 'style="display:none;"' : ''
    } onClick="hideIframe()">
        Cancel
      </button>
    `
  }
  if (data.request.type === 'account') {
    return `
    <button id='accept' class='${style.primaryButton}' ${
      data.error ? 'style="display:none;"' : ''
    } >
        Connect to existing ID
      </button>
      <button id='decline' class='${style.secondaryButton}' ${
      data.error ? 'style="display:none;"' : ''
    } >
        Create a new ID
      </button>
    `
  }
}

const error = (data) => `
  <p class='${style.walletSelect_error}'>${data.error}</p>
`

export default template
//  This site wants to access your profile${data.request.spaces.length === 0 ? '. ' : ' and ' + data.request.spaces.length + ' data source'}${data.request.spaces.length > 1 ? 's. ' : '.'}
