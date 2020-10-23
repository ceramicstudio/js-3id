import web3Modal from './providers.js'
const { ThreeIdConnect, EthereumAuthProvider } = require('./../src/index')
const THREEID_CONNECT_URL = 'http://localhost:30001'
import { DID } from 'dids'

const threeIdConnect = new ThreeIdConnect(THREEID_CONNECT_URL)

const authenticate = async () => {
  const ethProvider = await web3Modal.connect()
  const addresses = await ethProvider.enable()

  const authProvider = new EthereumAuthProvider(ethProvider, addresses[0])
  await threeIdConnect.connect(authProvider)

  const didProvider = await threeIdConnect.getDidProvider()
  const did = new DID({ provider: didProvider })

  await did.authenticate()
  console.log(did.id)

  const jws = await did.createJWS({ hello: 'world' })
  console.log(jws)
}

bauth.addEventListener('click', authenticate)
