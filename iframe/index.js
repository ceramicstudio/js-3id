const requestTemplate = require('./html/request.js').default
const providerTemplate = require('./html/providerSelect.js').default
const IdentityWalletService = require('../src/IdentityWalletService.js').default
const web3Modal = require('./provider').default
const getProfile = require('../../3box-js/lib/api.js').getProfile

const profileLoad = async (address) => {
  const profile = await getProfile(address)
  const img = profile.image
  const name = profile.name
  const imgUrl = (img && img[0] && img[0].contentUrl) ? `https://ipfs.infura.io/ipfs/${img[0].contentUrl['/']}` : 'https://i.imgur.com/RXJO8FD.png'
  return { name, imgUrl }
}

const render = async (request) => {
  let data = { request }
  if (request.opts.address) {
    // TODO should not block rendering, maybe remove for now, can also cache
    const profile = await profileLoad(request.opts.address)
    data = Object.assign(data, profile)
  }
  if (request.type === 'authenticate' && request.spaces.length === 0) data.request.spaces = ['root']
  root.innerHTML = request.type === 'authenticate' ? requestTemplate(data) : providerTemplate(data)
}


const providerNameFuncWrap = cb => str => {
  cb(str)
}

// hook into consent ui
const getConsent = async (req) => {
  await idwService.displayIframe()
  await render(req)

  const result = await new Promise((resolve, reject) => {
    accept.addEventListener('click', () => { resolve(true) })
    decline.addEventListener('click', () => { resolve(false )})
  })

  await idwService.hideIframe()
  return result
}

const selectProvider = async (address, origin) => {

  const result = new Promise((resolve, reject) => {
    window.providerNameFunc = providerNameFuncWrap(resolve)
  })

  await idwService.displayIframe()
  render({ origin, opts: {address}})

  await result

  // TODO get consent may not always follow, need better iframe control
  // await idwService.hideIframe()
  return result
}

// For testing, uncomment one line to see each view static
// render({ origin:"dashboard.3box.io", opts: { address:'0x9acb0539f2ea0c258ac43620dd03ef01f676a69b' }})
// render(JSON.parse(`{"type":"authenticate","origin":"dashboard.3box.io","spaces":["metamask", "3box", "things"], "opts": {"address":"0x9acb0539f2ea0c258ac43620dd03ef01f676a69b"}}`))

const idwService = new IdentityWalletService()
window.hideIframe = idwService.hideIframe.bind(idwService)
idwService.start(getConsent, selectProvider, web3Modal)
