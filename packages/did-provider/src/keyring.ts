import { generateKeyPairFromSeed } from '@stablelib/x25519'
import { HDNode } from '@ethersproject/hdnode'
import {
  ES256KSigner,
  Signer,
  Decrypter,
  x25519Decrypter,
  x25519Encrypter,
  createJWE,
  decryptJWE,
  JWE,
} from 'did-jwt'
import { randomBytes } from '@stablelib/random'
import { prepareCleartext, decodeCleartext } from 'dag-jose-utils'
import type { StreamMetadata } from '@ceramicnetwork/common'

import { encodeKey, hexToU8A } from './utils.js'

export const LATEST = 'latest'
const GENESIS = 'genesis'
const BASE_PATH = "m/51073068'"
const LEGACY_BASE_PATH = "m/7696500'/0'/0'"

export interface ThreeIdState {
  metadata: StreamMetadata
  content?: Record<string, any>
}

export interface KeySet {
  signing: Uint8Array
  management: Uint8Array
  encryption: Uint8Array
}

interface FullKeySet {
  seed: Uint8Array
  publicKeys: KeySet
  secretKeys: KeySet
  v03ID?: string
}

function deriveKeySet(seed: Uint8Array, v03ID?: string): FullKeySet {
  const seedNode = HDNode.fromSeed(seed)
  let hdNode
  if (v03ID) {
    hdNode = seedNode.derivePath(LEGACY_BASE_PATH)
  } else {
    hdNode = seedNode.derivePath(BASE_PATH)
  }
  const signing = hdNode.derivePath('0')
  // for v03ID the signing key is the management key
  const management = v03ID ? signing : hdNode.derivePath('1')
  const encryption = generateKeyPairFromSeed(hexToU8A(hdNode.derivePath('2').privateKey.slice(2)))
  return {
    seed,
    publicKeys: {
      signing: hexToU8A(signing.publicKey.slice(2)),
      management: hexToU8A(management.publicKey.slice(2)),
      encryption: encryption.publicKey,
    },
    secretKeys: {
      signing: hexToU8A(signing.privateKey.slice(2)),
      management: hexToU8A(management.privateKey.slice(2)),
      encryption: encryption.secretKey,
    },
    v03ID,
  }
}

export class Keyring {
  // map from 3ID version to key set
  #keySets: Record<string, FullKeySet> = {}
  // map from kid to encryption key
  #versionMap: Record<string, string> = {}
  // encrypted old seeds
  #pastSeeds: Array<JWE> = []
  // v03ID if legacy 3ID
  #v03ID?: string

  constructor(seed?: Uint8Array, v03ID?: string) {
    this.#v03ID = v03ID
    this.#versionMap[GENESIS] = LATEST
    this.#keySets[LATEST] = deriveKeySet(seed ?? randomBytes(32), v03ID)
    let encKid = encodeKey(this.#keySets[LATEST].publicKeys.encryption, 'x25519').slice(-15)
    this.#versionMap[encKid] = LATEST
    encKid = encodeKey(this.#keySets[LATEST].publicKeys.management, 'secp256k1')
    this.#versionMap[encKid] = LATEST
  }

  get v03ID(): string | undefined {
    return this.#v03ID
  }

  get seed(): Uint8Array {
    return this.#keySets[LATEST].seed
  }

  get pastSeeds(): Array<JWE> {
    return this.#pastSeeds
  }

  async loadPastSeeds(pastSeeds: Array<JWE>): Promise<void> {
    // Store a copy of the pastSeeds
    this.#pastSeeds = [...pastSeeds]
    // Decrypt each version with the version that came after it
    let version: string = LATEST
    let jwe = pastSeeds.pop()
    while (jwe) {
      const decrypted = await this.asymDecryptJWE(jwe, [], version)
      version = Object.keys(decrypted).find((k) => k !== 'v03ID') as string
      if (decrypted.v03ID) {
        this.#v03ID = decrypted.v03ID as string
        delete decrypted.v03ID
        this.#versionMap[GENESIS] = version
      }
      const currentKeySet = decrypted[version] as Array<number>
      this.#keySets[version] = deriveKeySet(new Uint8Array(currentKeySet), this.#v03ID)
      this._updateVersionMap(version, this.#keySets[version])
      jwe = pastSeeds.pop()
    }
  }

  _updateVersionMap(version: string, keySet: FullKeySet): void {
    let encKid = encodeKey(keySet.publicKeys.encryption, 'x25519').slice(-15)
    this.#versionMap[encKid] = version
    encKid = encodeKey(keySet.publicKeys.management, 'secp256k1')
    this.#versionMap[encKid] = version
  }

  async generateNewKeys(prevVersion: string): Promise<void> {
    if (this.#keySets[prevVersion]) throw new Error('Key set version already exist')
    // Map encryption kid, mgmt pub, and key set to prevVersion
    this._updateVersionMap(prevVersion, this.#keySets[LATEST])
    // Store previous key set
    this.#keySets[prevVersion] = this.#keySets[LATEST]
    // Generate a new seed and derive key set
    this.#keySets[LATEST] = deriveKeySet(randomBytes(32))
    // Add encryption kid and mgmt pub to map
    this._updateVersionMap(LATEST, this.#keySets[LATEST])
    // Encrypt the previous seed to the new seed
    const cleartext: Record<string, any> = { [prevVersion]: this.#keySets[prevVersion].seed }
    if (this.#keySets[prevVersion].v03ID) cleartext.v03ID = this.#keySets[prevVersion].v03ID
    this.#pastSeeds.push(await this.asymEncryptJWE(cleartext))
  }

  getAsymDecrypter(fragments: Array<string> = [], version?: string): Decrypter {
    if (!version) {
      const fragmentWithKey = fragments.find((fragment: string) => this.#versionMap[fragment])
      version = fragmentWithKey ? this.#versionMap[fragmentWithKey] : LATEST
    }
    const key = this.#keySets[version].secretKeys.encryption
    return x25519Decrypter(key)
  }

  async asymDecryptJWE(
    jwe: JWE,
    kids: Array<string>,
    version?: string
  ): Promise<Record<string, any>> {
    return decodeCleartext(await decryptJWE(jwe, this.getAsymDecrypter(kids, version)))
  }

  async asymEncryptJWE(cleartext: Record<string, any>, kid?: string): Promise<JWE> {
    const encrypter = x25519Encrypter(this.getEncryptionPublicKey(), kid)
    const payload = await prepareCleartext(cleartext)
    return await createJWE(payload, [encrypter])
  }

  getSigner(version: string = LATEST): Signer {
    // If we get an unknown version it's the latest
    // since we only store the version after a key rotation.
    const keyset = this.#keySets[version] || this.#keySets[LATEST]
    return ES256KSigner(keyset.secretKeys.signing)
  }

  getKeyFragment(version: string = LATEST, encKey = false): string {
    // If we get an unknown version it's the latest
    // since we only store the version after a key rotation.
    const keyset = this.#keySets[version] || this.#keySets[LATEST]
    if (encKey) {
      return encodeKey(keyset.publicKeys.encryption, 'x25519').slice(-15)
    }
    return encodeKey(keyset.publicKeys.signing, 'secp256k1').slice(-15)
  }

  getMgmtSigner(pubKey: string): Signer {
    const keyset = this.#keySets[this.#versionMap[pubKey]].secretKeys
    if (!keyset) throw new Error(`Key not found: ${pubKey}`)
    return ES256KSigner(keyset.management)
  }

  getEncryptionPublicKey(): Uint8Array {
    return this.#keySets[LATEST].publicKeys.encryption
  }

  get3idState(genesis?: boolean): ThreeIdState {
    const keyVer = genesis ? this.#versionMap[GENESIS] : LATEST
    const keys = this.#keySets[keyVer].publicKeys
    const signing = encodeKey(keys.signing, 'secp256k1')
    const encryption = encodeKey(keys.encryption, 'x25519')
    // use the last 12 chars as key id
    const state: ThreeIdState = {
      metadata: { controllers: [`did:key:${encodeKey(keys.management, 'secp256k1')}`] },
      content: {
        publicKeys: {
          [signing.slice(-15)]: signing,
          [encryption.slice(-15)]: encryption,
        },
      },
    }
    if (genesis) {
      state.metadata.family = '3id'
    }
    if (this.#keySets[keyVer].v03ID) {
      state.metadata.deterministic = true
      delete state.content
    }
    return state
  }
}
