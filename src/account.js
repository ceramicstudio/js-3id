import { expose } from 'postmsg-rpc'
import nacl from 'tweetnacl'
import naclutil from 'tweetnacl-util'
nacl.util = naclutil
import crypto from 'crypto'
import store from 'store'

const AUTH_SERVICE_URL = 'http://localhost:3003'


class Account {
  constructor (actions, opts = {}) {
    this.actions = actions
    this.persist = !opts.noPersist
    this.allowedOrigins = {}
    if (this.persist) {
      this._seed = store.get('seed')
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
    console.log('ori', origin)

    if (!this.seed) {
      let err
      do {
        const authInput = await this.actions.getAuthInput()
        if (authInput.type === 'create') {
          err = await this.create(authInput.email, authInput.pass)
        } else if (authInput.type === 'auth') {
          err = await this.auth(authInput.email, authInput.pass)
        } else if (authInput.type === 'cancel') {
          throw new Error('Access denied')
        }
        if (err) {
          this.actions.displayError(err)
        }
      } while (err)
    }
    if (!this.isOriginAllowed(origin)) {
      await this.actions.getOriginConsent(origin)
      // the above throws if consent not given
      this.allowOrigin(origin)
    }
    return this.seed
  }

  get seed () {
    return this._seed
  }

  set seed (seed) {
    this._seed = seed
    if (this.persist) {
      store.set('seed', seed)
    }
  }

  allowOrigin (origin) {
    if (!this.allowedOrigins) {
      this.allowedOrigins = store.get('allowedOrigins')
    }
    this.allowedOrigins[origin] = true
    if (this.persist) {
      store.set('allowedOrigins', this.allowedOrigins)
    }
  }

  isOriginAllowed (origin) {
    return this.allowedOrigins[origin]
  }

  async create (email, password) {
    const auth = email + password
    const authProof = crypto.createHash('sha256').update(auth).digest('hex')
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
    this.seed = Buffer.from(seed).toString('hex')
  }

  async auth (email, password) {
    const auth = email + password
    const authProof = crypto.createHash('sha256').update(auth).digest('hex')

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
    this.seed = Buffer.from(seed).toString('hex')
  }
}

export default Account
