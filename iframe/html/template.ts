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
        <span> Connect your data </span>
      </div>

      <div class='${style.close}' onClick="hideIframe()">
        <div class='${style.close_line} ${style.flip}'></div>
        <div class='${style.close_line}'></div>
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
      <div class='${style.footerText}'>
        <p> This site uses Ceramic and 3ID to give you control of your data.
          <a href="https://ceramic.network" rel="noopener noreferrer" target="_blank">
            What is this?
          </a>
        </p>
      </div>
    </div>
  </div>
`

const content = (data) => {
  if (data.request.type === 'authenticate') {
    return `This site wants to access your profile${
      data.request.paths.length === 0 ? '' : ' and ' + data.request.paths.length + ' data source'
    }${data.request.paths.length > 1 ? 's. ' : '.'}`
  }
  if (data.request.type === 'account') {
    return `You have not used this account with 3id, do you want to link this account?`
  }
  if (data.request.type === 'create') {
    return `Do you want to create a new account?`
  }
  if (data.request.type === 'link') {
    return `Do you want to link this account to ${data.request.baseDid.substring(0, 18)}... ?`
  }
}

const actions = (data) => {
  if (data.request.type === 'authenticate' || data.request.type === 'create') {
    return `
      <button id='accept' class='${style.primaryButton}' ${
      data.error ? 'style="display:none;"' : ''
    } >
        Continue
      </button>
    `
  }
  if (data.request.type === 'account' || data.request.type === 'link') {
    return `
      <button id='accept' style='margin-right:8%;' class='${style.primaryButtonHalf}' ${
      data.error ? 'style="display:none;"' : ''
    } >
        Yes
      </button>
      <button id='decline' class='${style.primaryButtonHalf}' ${
      data.error ? 'style="display:none;"' : ''
    } >
        No
      </button>
    `
  }
}

export default template

const error = (data) => `
  <p class='${style.walletSelect_error}'>${data.error}</p>
`

//  This site wants to access your profile${data.request.spaces.length === 0 ? '. ' : ' and ' + data.request.spaces.length + ' data source'}${data.request.spaces.length > 1 ? 's. ' : '.'}
