import { expose } from 'postmsg-rpc'
import Account from './account'

const authenticateApp = async (origin, spaces) => {
  console.log('ori', origin)
  viewMain.style.display = 'block'

  let account = new Account({ noPersist: true })
  //let account = new Account()
  const seed = await getSeed(account)
  if (!account.isOriginAllowed(origin)) {
    await getOriginConsent(account, origin)
  }
  return seed
}

const getOriginConsent = (account, origin) => {
  viewConsent.style.display = 'block'
  consentText.innerHTML = `Allow ${origin} to access your 3Box account`
  return new Promise((resolve, reject) => {
    acceptConsent.addEventListener('click', () => {
      viewConsent.style.display = 'none'
      account.allowOrigin(origin)
      resolve()
    })
  })
}

const getSeed = account => {
  if (account.seed) {
    viewMain.style.display = 'none'
    return Promise.resolve(account.seed)
  }
  return new Promise((resolve, reject) => {
    const createAccount = async () => {
      viewMain.style.display = 'none'
      viewCreate.style.display = 'block'

      create2.addEventListener('click', async () => {
        // TODO - check if pw1 = pw2
        const email = emailAddrCreate.value
        const pass = pw1Create.value
        try {
          const seed = await account.create(email, pass)
          viewCreate.style.display = 'none'
          resolve(seed)
        } catch (e) {
          createError.innerHTML = e.message
        }
      })
    }
    const authenticateAccount = () => {
      viewMain.style.display = 'none'
      viewAuth.style.display = 'block'

      auth2.addEventListener('click', async () => {
        const email = emailAddrAuth.value
        const pass = pw1Auth.value
        try {
          const seed = await account.auth(email, pass)
          viewAuth.style.display = 'none'
          resolve(seed)
        } catch (e) {
          authError.innerHTML = e.message
        }
      })
    }
    auth.addEventListener('click', authenticateAccount)
    create.addEventListener('click', createAccount)
  })
}

expose('auth', authenticateApp, {
  postMessage: window.parent.postMessage.bind(window.parent),
  getMessageData: e => {
    if (e.data.sender === 'postmsg-rpc/client') {
      e.data.args.unshift(e.origin)
    }
    return e.data
  }
})
