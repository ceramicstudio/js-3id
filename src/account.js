import nacl from 'tweetnacl'
import naclutil from 'tweetnacl-util'
nacl.util = naclutil
import crypto from 'crypto'
import store from 'store'

const AUTH_SERVICE_URL = 'http://localhost:3000'


class Account {
  constructor (opts = {}) {
    this.persist = !opts.noPersist
    this.allowedOrigins = {}
    if (this.persist) {
      this._seed = store.get('seed')
      this.allowedOrigins = store.get('allowedOrigins')
    }
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
    const authProof = crypto.createHash('sha256').update(email + password).digest('hex')
    const e1Salt = Buffer.from(nacl.randomBytes(32)).toString('hex')
    const e1 = crypto.pbkdf2Sync(authProof, e1Salt, 20000, 32, 'sha256')
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
    if (res.ok) {
      this.seed = Buffer.from(seed).toString('hex')
      return this.seed
    } else {
      throw new Error((await res.json()).message)
    }
  }

  async auth (email, password) {
    const authProof = crypto.createHash('sha256').update(email + password).digest('hex')

    const res = await fetch(`${AUTH_SERVICE_URL}/authenticate?auth-proof=${authProof}`)
    if (res.ok) {
      const { data } = await res.json()
      const e1 = crypto.pbkdf2Sync(authProof, data['key-salt'], 20000, 32, 'sha256')
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
      return this.seed
    } else {
      throw new Error((await res.json()).message)
    }
  }
}

export default Account
