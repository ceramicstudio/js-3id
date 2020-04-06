const style = require('style-loader!../../style.scss')
const assets = require('./assets/assets.js')

const providerSelect = (data) => `
  <div class='${style.actions}'>
    <div class='${style.walletSelect}' onClick="handleOpenWalletOptions()">
      <div class='${style.walletSelect_content}'>
        <h5>
          <div id='selectedWallet'> ${getProvider(data.request.opts.address) || 'Choose wallet'} </div>
        </h5>
      </div>
      <p class='${style.walletSelect_error}'>Try again. Use the same account you used for this app.</p>
    </div>

    <div class='${style.providerBox}' id='walletOptions' onClick="handleOpenWalletOptions()">
      <div class='${style.provider}' onClick="providerNameFunc('injected', '${data.request.opts.address}')">
        <img src='${assets.metamask}' class='${style.providerImage}' />
        <div class='${style.providerText}'> Metamask </div>
      </div>

      <div class='${style.provider}' onClick="providerNameFunc('fortmatic', '${data.request.opts.address}')">
        <img src='${assets.fortmatic}' class='${style.providerImage}' />
        <div class='${style.providerText}'> Fortmatic </div>
      </div>

      <div class='${style.provider}' onClick="providerNameFunc('portis', '${data.request.opts.address}')">
        <img src='${assets.portis}' class='${style.providerImage}' />
        <div class='${style.providerText}'> Portis </div>
      </div>

      <div class='${style.provider}' onClick="providerNameFunc('authereum', '${data.request.opts.address}')">
        <img src='${assets.authereum}' class='${style.providerImage}' />
        <div class='${style.providerText}'> Authereum </div>
      </div>

      <div class='${style.provider}' onClick="providerNameFunc('wallet', '${data.request.opts.address}')" >
        <img src='${assets.walletConnect}' class='${style.providerImage}'/>
        <div class='${style.providerText}'> Wallet Connect</div>
      </div>
    </div>

    <button id='accept' class='${style.primaryButton}'>
      Continue
    </button>

    <button id='decline' class='${style.secondaryButton}'>
      Cancel
    </button>
  </div>
`

export default providerSelect
