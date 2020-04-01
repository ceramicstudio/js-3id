const style = require('style-loader!./../style.scss')

const template = (data, content) => `
  <div class=${style.controls}>
    <div class='${style.return}' onClick="hideIframe()"> <- Return </div>
    <div class='${style.close}' onClick="hideIframe()"> X </div>
  </div>
  <div class='${style.content}'>
    <div class='${style.header}'>
      <div class='${style.headerLogo}'></div>
      <div class='${style.headerText}'>
        <div class='${style.primary}'> ${data.request.origin} </div>
        <div class='${style.sub}'> wants to access your 3ID </div>
      </div>
      ${data.name ? profile(data) : ``}
    </div>
    <div class='${style.promptBox}'>
      ${content}
    </div>
  </div>
`

const profile = (data) => `
  <div class='${style.headerProfile}'>
    <img class='${style.img}' src='${data.imgUrl}'> </img>
    <div class='${style.name}'> ${data.name} </div>
  </div>
`

export default template
