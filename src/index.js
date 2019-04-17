import Account from './account'

const getOriginConsent = (origin) => {
  viewConsent.style.display = 'block'
  consentText.innerHTML = `Allow ${origin} to access your 3Box account`
  return new Promise((resolve, reject) => {
    acceptConsent.addEventListener('click', () => {
      viewConsent.style.display = 'none'
      resolve()
    })
    rejectConsent.addEventListener('click', () => {
      viewConsent.style.display = 'none'
      reject('Access denied')
    })
  })
}

const getAuthInput = () => {
  viewMain.style.display = 'block'

  return new Promise((resolve, reject) => {
    const createAccount = async () => {
      viewMain.style.display = 'none'
      dispError.style.display = 'none'
      viewCreate.style.display = 'block'

      create2.addEventListener('click', async () => {
        // TODO - validate input
        // TODO - check if pw1 = pw2
        const email = emailAddrCreate.value
        const pass = pw1Create.value
        viewCreate.style.display = 'none'
        resolve({
          type: 'create',
          email,
          pass
        })
      })
    }
    const authenticateAccount = () => {
      viewMain.style.display = 'none'
      dispError.style.display = 'none'
      viewAuth.style.display = 'block'

      auth2.addEventListener('click', async () => {
        // TODO - validate input
        const email = emailAddrAuth.value
        const pass = pw1Auth.value
        viewAuth.style.display = 'none'
        resolve({
          type: 'auth',
          email,
          pass
        })
      })
    }
    auth.addEventListener('click', authenticateAccount)
    create.addEventListener('click', createAccount)
    cancel.addEventListener('click', () => {
      resolve({ type: 'cancel' })
    })
  })
}

const displayError = message => {
  dispError.style.display = 'block'
  dispError.innerHTML = message
}

const opts = { noPersist: true }
const actions = {
  getAuthInput,
  getOriginConsent,
  displayError
}
const account = new Account(actions, opts)
