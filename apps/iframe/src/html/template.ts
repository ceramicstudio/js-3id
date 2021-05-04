import * as assets from './../assets/assets'

const style = require('style-loader!../css/style.scss')

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
      return `${did.substring(0, 10)}...${did.substring(did.length - 5, did.length)}`
    } 
    return ``
  }
  if (data.request.type === 'account') {
    return `<a href="https://ceramic.network" rel="noopener noreferrer" target="_blank">
    What is this?
  </a>`
  }
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
  // may not use 
  if (data.request.type === 'migration') {
    return `Migrate ${data.request.legacyDid.substring(0, 18)}... ?`
  }
}

const actions = (data) => {
  if (data.request.type === 'authenticate') {
    return `
      <button id='accept' class='${style.primaryButton}' ${
      data.error ? 'style="display:none;"' : ''
    } >
        Continue
      </button>
      <button id='decline' class='${style.secondaryButton}' ${
        data.error ? 'style="display:none;"' : ''
      } >
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

export default template

const error = (data) => `
  <p class='${style.walletSelect_error}'>${data.error}</p>
`

//  This site wants to access your profile${data.request.spaces.length === 0 ? '. ' : ' and ' + data.request.spaces.length + ' data source'}${data.request.spaces.length > 1 ? 's. ' : '.'}
