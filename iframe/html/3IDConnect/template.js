const style = require('style-loader!../../style.scss')
const assets = require('./assets/assets.js')

const capitalizeFirst = string => string.charAt(0).toUpperCase() + string.slice(1)
const spaceString = (spaces) => spaces.join(', ')

const template = (data, content, isMobile) => `
  <div class='${style.card} ${isMobile ? style.cardMobile : ''}'>
    <div class=${style.controls}>
      <a 
      href="https://3box.io"
      rel="noopener noreferrer"
      target="_blank"
      class=${style.controls_logo}
      >
        ${assets.Logo}
      </a>

      <div class='${style.close}' onClick="hideIframe()">
        <div class='${style.close_line} ${style.flip}'></div>
        <div class='${style.close_line}'></div>
      </div>
    </div>

    <div class='${style.content} ${isMobile ? style.contentMobile : ''}' id='content' >
      <div class='${style.header}'>
        <img 
          src='${`https://${data.request.origin}/favicon.ico`}' 
          class='${style.headerLogo}' 
          onError='handleBrokenImage(this)'
          id='siteFavicon'
        />

        <div class='${style.headerText}'>
          <div class='${style.primary}'>
            ${data.request.origin}
          </div>
          <p class='${style.sub}'> wants to access your data </p>
        </div>

        <div class='${style.promptText}'>
          <div class='${style.subText}'>
            <p>
            <span>${capitalizeFirst(data.request.origin)}</span> uses 3ID to give you privacy and control over your data.
            This app wants to access: ${spaceString(data.request.spaces)}.
            </p>
            ${data.error ? error(data) : ``}
          </div>
        </div>
      </div>
      <div class='${style.promptBox}'>
        ${content}
      </div>
    </div>
  </div>
  <div class='${style.onClickOutside}' id='onClickOutside' onClick="handleOpenWalletOptions()"></div>
`
export default template

const error = (data) => `
  <p class='${style.walletSelect_error}'>${data.error}</p>
`