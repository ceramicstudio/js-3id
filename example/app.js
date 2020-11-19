import web3Modal from './providers.js'
const { ThreeIdConnect, EthereumAuthProvider } = require('./../src/index')
const THREEID_CONNECT_URL = 'http://localhost:30001'
import { DID } from 'dids'

const threeIdConnect = new ThreeIdConnect(THREEID_CONNECT_URL)
let ethAddress

const authenticate = async () => {
  const ethProvider = await web3Modal.connect()
  const addresses = await ethProvider.enable()

  let ethAddress = addresses[0]
  const authProvider = new EthereumAuthProvider(ethProvider, ethAddress)
  await threeIdConnect.connect(authProvider)

  const didProvider = await threeIdConnect.getDidProvider()
  const did = new DID({ provider: didProvider })

  await did.authenticate()
  console.log(did.id)

  const jws = await did.createJWS({ hello: 'world' })
  console.log(jws)
}

// TODO must connect first 
let accountslist
const accounts = async () => {
  accountslist = await threeIdConnect.accounts()
  console.log(accounts)


}

const create = async () => {
  const res = await threeIdConnect.createAccount()
  console.log(res)
}

const link = async () => {
  const res = await threeIdConnect.createAndLink(accountslist[0])
  console.log(res)
}



bauth.addEventListener('click', authenticate)
baccounts.addEventListener('click', accounts)
bcreate.addEventListener('click', create)
blink.addEventListener('click', link)
