const style = require('style-loader!./../style.scss')
const template = require('./3IDConnect/template.js').default
const assets = require('./3IDConnect/assets/assets.js')

const providerTemplate = (data) => template(data, providerSelect())

const providerSelect = () => `
  <div class='${style.actions}'>
    <div class='${style.walletSelect}' onClick="handleOpenWalletOptions()"> 
      <div class='${style.walletSelect_content}'>
        <h5>
          Choose wallet
        </h5>
      </div>
      <p class='${style.walletSelect_error}'>Try again. Use the same account you used for this app.</p>
    </div>

    <div class='${style.providerBox}' id='walletOptions' onClick="handleOpenWalletOptions()">
      <div class='${style.provider}' onClick="providerNameFunc('injected')">
        <img src='${assets.metamask}' class='${style.providerImage}' />
        <div class='${style.providerText}'> Metamask </div>
      </div>

      <div class='${style.provider}' onClick="providerNameFunc('fortmatic')">
        <img src='${assets.fortmatic}' class='${style.providerImage}' />
        <div class='${style.providerText}'> Fortmatic </div>
      </div>

      <div class='${style.provider}' onClick="providerNameFunc('portis')">
        <img src='${assets.portis}' class='${style.providerImage}' />
        <div class='${style.providerText}'> Portis </div>
      </div>

      <div class='${style.provider}' onClick="providerNameFunc('authereum')">
        <img src='${assets.authereum}' class='${style.providerImage}' />
        <div class='${style.providerText}'> Authereum </div>
      </div>

      <div class='${style.provider}' onClick="providerNameFunc('wallet')" >
        <img src='${assets.walletConnect}' class='${style.providerImage}'/>
        <div class='${style.providerText}'> Wallet Connect</div>
      </div>
    </div>  

    <button class='${style.primaryButton}'>
      Continue
    </button>

    <button class='${style.secondaryButton}'>
      Cancel
    </button>
  </div>
`

export default providerTemplate

{
  /* <div class='${style.subText}'> This must match the wallet used for dasboard.3box.io </div> */
}

{
  /* <div class='${style.providerRow}'>
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
  </div> */
}