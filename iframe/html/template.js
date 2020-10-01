const style = require('style-loader!../css/style.scss')
const assets = require('./../assets/assets.js')

const capitalizeFirst = string => string.charAt(0).toUpperCase() + string.slice(1)
const spaceString = (spaces) => spaces.join(', ')

const template = (data,isMobile) => `
  <div class='${style.card} ${isMobile ? style.cardMobile : ''} ${isMobile && !data.error ? style.slideBottom : !data.error ? style.slideLeft : ''}'>
    <div class=${style.controls}>
      <div class=${style.controls_logo}>
        <a
        href="https://3box.io"
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
           
            </p>
          </div>
        </div>
        <div class='${style.actions}' id='action'>
          <button id='accept' class='${style.primaryButton}' ${data.error ? 'style="display:none;"' : ''} >
            Continue
          </button>
          ${data.error ? error(data) :''}
        </div>
      </div>
      <div class='${style.footerText}'>
        <p> This site uses 3Box and 3ID to give you control of your data.
          <a href="https://3box.io" rel="noopener noreferrer" target="_blank">
            What is this?
          </a>
        </p>
      </div>
    </div>
  </div>
`
export default template

const error = (data) => `
  <p class='${style.walletSelect_error}'>${data.error}</p>
`


//  This site wants to access your profile${data.request.spaces.length === 0 ? '. ' : ' and ' + data.request.spaces.length + ' data source'}${data.request.spaces.length > 1 ? 's. ' : '.'}