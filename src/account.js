import { expose } from 'postmsg-rpc'
import nacl from 'tweetnacl'
import naclutil from 'tweetnacl-util'
import { HDNode } from 'ethers/utils'
nacl.util = naclutil
import crypto from 'crypto'
import store from 'store'

const AUTH_SERVICE_URL = 'http://localhost:3003'
const BASE_PATH = "m/51073068'/0'"

const sha256 = msg => crypto.createHash('sha256').update(msg).digest('hex')

class Account {
  constructor (actions, opts = {}) {
    this.actions = actions
    this.persist = !opts.noPersist
    this.allowedOrigins = {}
    if (this.persist) {
      this._rootSeed = store.get('rootSeed')
      this.allowedOrigins = store.get('allowedOrigins')
    }
    this.exposeRpc()
  }

  exposeRpc () {
    expose('auth', this.authenticateApp.bind(this), {
      postMessage: window.parent.postMessage.bind(window.parent),
      getMessageData: e => {
        if (e.data.sender === 'postmsg-rpc/client') {
          e.data.args.unshift(e.origin)
        }
        return e.data
      }
    })
  }

  async authenticateApp (origin, spaces) {
    if (!this.rootSeed) {
      let err
      do {
        const authInput = await this.actions.getAuthInput()
        if (authInput.type === 'create') {
          err = await this.create(authInput.email, authInput.pass)
        } else if (authInput.type === 'auth') {
          err = await this.auth(authInput.email, authInput.pass)
        } else if (authInput.type === 'cancel') {
          throw new Error('Canceled')
        }
        if (err) {
          this.actions.displayError(err)
        }
      } while (err)
    }
    if (!this.isOriginAllowed(origin, spaces)) {
      await this.actions.getOriginConsent(origin, spaces)
      // the above throws if consent not given
      this.allowOrigin(origin, spaces)
    }
    const keys = this.deriveKeys(spaces)
    return keys
  }

  deriveKeys (spaces) {
    const baseNode = HDNode.fromSeed(this.rootSeed).derivePath(BASE_PATH)
    // for the main seed we just use the 0 path
    const mainNode = baseNode.derivePath("0'/0'/0'/0'/0'/0'/0'/0'")
    const spaceKeys = spaces.reduce((acc, space) => {
      const spaceHash = sha256(`${space}.3box`)
      // convert hash to path
      const spacePath = spaceHash.match(/.{1,12}/g) // chunk hex string
        .map(n => parseInt(n, 16).toString(2)) // convert to binary
        .map(n => (n.length === 47 ? '0' : '') + n) // make sure that binary strings have the right length
        .join('').match(/.{1,31}/g) // chunk binary string for path encoding
        .map(n => parseInt(n, 2)).join("'/") + "'" // convert to uints and create path
      acc[space] = baseNode.derivePath(spacePath).extendedKey
      return acc
    }, {})
    return {
      main: mainNode.extendedKey,
      spaces: spaceKeys
    }
  }

  get rootSeed () {
    return this._rootSeed
  }

  set rootSeed (rootSeed) {
    this._rootSeed = `0x${rootSeed}`
    if (this.persist) {
      store.set('rootSeed', rootSeed)
    }
  }

  allowOrigin (origin, spaces) {
    if (!this.allowedOrigins[origin]) {
      this.allowedOrigins[origin] = {
        main: true,
        spaces: []
      }
    }
    this.allowedOrigins[origin].spaces = [...new Set([
      ...this.allowedOrigins[origin].spaces,
      ...spaces
    ])]
    if (this.persist) {
      store.set('allowedOrigins', this.allowedOrigins)
    }
  }

  isOriginAllowed (origin, spaces) {
    if (!this.allowedOrigins[origin]) return false
    const spacesAllowed = spaces.every(space => this.allowedOrigins[origin].spaces.includes(space))
    return this.allowedOrigins[origin].main && spacesAllowed
  }

  async create (email, password) {
    const auth = email + password
    const authProof = sha256(auth)
    const e1Salt = Buffer.from(nacl.randomBytes(32)).toString('hex')
    const e1 = crypto.pbkdf2Sync(auth, e1Salt, 20000, 32, 'sha256')
    const seed = nacl.randomBytes(32)
    const e0 = nacl.randomBytes(32)
    const nonceSeed = nacl.randomBytes(24)
    const encSeed = nacl.secretbox(seed, nonceSeed, e0)
    const nonceE0 = nacl.randomBytes(24)
    const encE0 = nacl.secretbox(e0, nonceE0, e1)

    const body = {
      "auth-proof": authProof,
      "key-salt": e1Salt,
      "enc-seed": {
        ciphertext: nacl.util.encodeBase64(encSeed),
        nonce: nacl.util.encodeBase64(nonceSeed)
      },
      "enc-secret": {
        ciphertext: nacl.util.encodeBase64(encE0),
        nonce: nacl.util.encodeBase64(nonceE0)
      }
    }
    const opts = {
      body: JSON.stringify(body),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }
    const res = await fetch(AUTH_SERVICE_URL + '/create', opts)
    console.log('res', res)
    if (!res.ok) {
      return (await res.json()).message
    }
    this.rootSeed = Buffer.from(seed).toString('hex')
  }

  async auth (email, password) {
    const auth = email + password
    const authProof = sha256(auth)

    const res = await fetch(`${AUTH_SERVICE_URL}/authenticate?auth-proof=${authProof}`)
    if (!res.ok) {
      return (await res.json()).message
    }
    const { data } = await res.json()
    const e1 = crypto.pbkdf2Sync(auth, data['key-salt'], 20000, 32, 'sha256')
    const e0 = nacl.secretbox.open(
      nacl.util.decodeBase64(data['enc-secret'].ciphertext),
      nacl.util.decodeBase64(data['enc-secret'].nonce),
      e1
    )
    const seed = nacl.secretbox.open(
      nacl.util.decodeBase64(data['enc-seed'].ciphertext),
      nacl.util.decodeBase64(data['enc-seed'].nonce),
      e0
    )
    this.rootSeed = Buffer.from(seed).toString('hex')
  }
}

export default Account
