const style = require('style-loader!./../style.less')

const providerTemplate = (data, providerNameFunc) => `
  <div id='${style.providerBox}'>
    <div id='${style.providerHeader}'>
      <span> Select your provider </span>
    </div>
    <div id='${style.providerSelect}'>
      <button id="providerBtn" type="button" onClick="providerNameFunc('injected')" class="btn btn-primary">Metamask</button>
      <button id="providerBtn" type="button" onClick="providerNameFunc('fortmatic')" class="btn btn-primary">Fortmatic</button>
      <button id="providerBtn" type="button" class="btn btn-primary">Portis</button>
      <button id="providerBtn" type="button" class="btn btn-primary">Authereum</button>
      <button id="providerBtn" type="button" class="btn btn-primary">WalletConnect</button>
    </div>
  </div>
`

export default providerTemplate
