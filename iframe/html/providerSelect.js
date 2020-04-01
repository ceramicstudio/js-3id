const style = require('style-loader!./../style.scss')
const template = require('./template.js').default

const providerTemplate = (data) => template(data, providerSelect())

const providerSelect = () => `
<div class='${style.promptHeader}'>
  <div class='${style.promptText}'>
    <div class='${style.primaryText}'> <span class='${style.primaryHighlight}'> Select Your Wallet </span> </div>
    <div class='${style.subText}'> This must match the wallet used for dasboard.3box.io </div>
  </div>
  <div class='${style.promptImage}'></div>
</div>
<div class='${style.divider}'></div>
<div class='${style.providerBox}'>
  <div class='${style.providerRow}'>
    <div class='${style.provider}' onClick="providerNameFunc('injected')">
      <div class='${style.providerImage}'> </div>
      <div class='${style.providerText}'> Metamask </div>
    </div>
    <div class='${style.provider}' onClick="providerNameFunc('fortmatic')">
    <div class='${style.providerImage}'> </div>
      <div class='${style.providerText}'> Fortmatic </div>
    </div>
  </div>
  <div class='${style.providerRow}' onClick="providerNameFunc('portis')">
    <div class='${style.provider}'>
      <div class='${style.providerImage}'> </div>
      <div class='${style.providerText}'> Portis </div>
    </div>
    <div class='${style.provider}'>
      <div class='${style.providerImage}' onClick="providerNameFunc('authereum')"> </div>
      <div class='${style.providerText}'> Authereum </div>
    </div>
  </div>
</div>
`

export default providerTemplate
