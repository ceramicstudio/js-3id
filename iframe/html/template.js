const style = require('style-loader!./../style.less')

const template = (data, content) => `
  <div class=${style.controls}>
    <div class='${style.return}' onClick="hideIframe()"> <- Return </div>
    <div class='${style.close}' onClick="hideIframe()"> X </div>
  </div>
  <div class='${style.content}'>
    <div class='${style.header}'>
      <div class='${style.headerLogo}'></div>
      <div class='${style.headerText}'>
        <div class='${style.primary}'> dashboard.3box.io </div>
        <div class='${style.sub}'> wants to access your 3ID </div>
      </div>
      <div class='${style.headerProfile}'>
        <div class='${style.img}'> </div>
        <div class='${style.name}'> Zach Ferland </div>
      </div>
    </div>
    <div class='${style.promptBox}'>
      ${content}
    </div>
  </div>
`

export default template
