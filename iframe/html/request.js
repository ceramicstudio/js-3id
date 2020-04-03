const style = require('style-loader!./../style.scss')
const template = require('./3IDConnect/template.js').default

const requestTemplate = (data) => template(data, request(data))

const request = (data) => `
  <div>
    <div class='${style.promptHeader}'>
      <div class='${style.promptText}'>
        <div class='${style.primaryText}'> This will allow <span class='${style.primaryHighlight}'> ${data.request.origin} </span> to</div>
        <div class='${style.subText}'> Temporarily see, edit, and delete data in the following locations </div>
      </div>
      <div class='${style.promptImage}'></div>
    </div>
    <div class='${style.divider}'></div>
    <div class='${style.providerBox}'>
       ${spaces(data.request.spaces)}
    </div>
    <div class='${style.divider} ${style.marginTop25}'></div>
    <div class='${style.buttonFooter}'>
       <div id="decline" type="button" class="${style.btnDecline}">Cancel</div>
       <button id="accept" type="button" class="btn ${style.btnAllow}">Allow</button>
     </div>
  </div>
`

const spaces = (spaces) => {
  return spaces.map(spaceLine).reduce((acc, val) => acc + val, ``)
}

const spaceLine = (spaceName) => `
  <div class='${style.spaceLine}'>
    <div class='${style.spaceName}'>
      ${spaceName}
    </div>
    <div class='${style.access}'>
      <span> Allow </span>
    </div>
  </div>
`

export default requestTemplate
