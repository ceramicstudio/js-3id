/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import type { AuthData, JWE as StoredJWE, WrappedJWE } from '@3id/model'
import type { JWE } from 'did-jwt'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'

import type { DidProvider } from './did-provider.js'
import { Keyring, LATEST } from './keyring.js'
import type { ThreeIDX, NewAuthEntry } from './three-idx.js'
import { parseJWEKids } from './utils.js'

async function decryptAuthId(encrypted: WrappedJWE, keyring: Keyring): Promise<string> {
  if (!encrypted.jwe) throw new Error('Invalid encrypted block')
  const decrypted = await keyring.asymDecryptJWE(
    encrypted.jwe as JWE,
    parseJWEKids(encrypted.jwe as JWE)
  )
  return decrypted.id as string
}

const encrypter = new DID({ resolver: getResolver() })

async function authSecretToDID(authSecret: Uint8Array): Promise<DID> {
  const did = new DID({
    provider: new Ed25519Provider(authSecret),
    resolver: getResolver(),
  })
  await did.authenticate()
  return did
}

export async function newAuthEntry(
  keyring: Keyring,
  threeIdDid: string,
  authId: string,
  authSecret: Uint8Array
): Promise<NewAuthEntry> {
  const mainKid = `${threeIdDid}#${keyring.getKeyFragment(LATEST, true)}`
  const did = await authSecretToDID(authSecret)

  const cleartext: Record<string, any> = { seed: keyring.seed }
  // If we have a legacy seed v03ID will be defined
  if (keyring.v03ID) cleartext.v03ID = keyring.v03ID
  const resolvedPromises = await Promise.all([
    did.createDagJWE(cleartext, [did.id]),
    keyring.asymEncryptJWE({ id: authId }, mainKid),
  ])
  return {
    did,
    mapEntry: {
      [did.id]: {
        data: { jwe: resolvedPromises[0] as StoredJWE },
        id: { jwe: resolvedPromises[1] as StoredJWE },
      },
    },
  }
}

export async function updateAuthEntry(
  keyring: Keyring,
  authEntry: AuthData,
  removedAuthIds: Array<string>,
  threeIdDid: string,
  authDid: string
): Promise<AuthData | null> {
  const mainKid = `${threeIdDid}#${keyring.getKeyFragment(LATEST, true)}`
  const authId = await decryptAuthId(authEntry.id as WrappedJWE, keyring)
  // Return null if auth entry should be removed
  if (removedAuthIds.find((id) => id === authId)) return null
  const jwes = await Promise.all([
    encrypter.createDagJWE({ seed: keyring.seed }, [authDid]),
    keyring.asymEncryptJWE({ id: authId }, mainKid),
  ])
  return {
    data: { jwe: jwes[0] as StoredJWE },
    id: { jwe: jwes[1] as StoredJWE },
  }
}

async function rotateKeys(
  threeIdx: ThreeIDX,
  keyring: Keyring,
  removedAuthIds: Array<string>
): Promise<void> {
  const version = threeIdx.get3idVersion()
  await keyring.generateNewKeys(version)
  const update3idState = keyring.get3idState()
  const authMap = await threeIdx.getAuthMap()
  const newAuthMap: Record<string, any> = {}
  await Promise.all(
    Object.keys(authMap).map(async (authDid) => {
      const entry = await updateAuthEntry(
        keyring,
        authMap[authDid],
        removedAuthIds,
        threeIdx.id,
        authDid
      )
      if (entry) {
        newAuthMap[authDid] = entry
      }
    })
  )
  await threeIdx.rotateKeys(update3idState, keyring.pastSeeds as Array<StoredJWE>, newAuthMap)
}

interface PendingAdd {
  authId: string
  entry: NewAuthEntry
}

interface KeychainStatus {
  clean: boolean
  adding: Array<string>
  removing: Array<string>
}

export class Keychain {
  #keyring: Keyring
  #threeIdx: ThreeIDX
  #pendingAdds: Array<PendingAdd> = []
  #pendingRms: Array<string> = []

  /**
   * The Keychain enables adding and removing of authentication methods.
   */
  constructor(keyring: Keyring, threeIdx: ThreeIDX) {
    this.#keyring = keyring
    this.#threeIdx = threeIdx
  }

  get keyring(): Keyring {
    return this.#keyring
  }

  /**
   * List all current authentication methods.
   *
   * @return    {Array<string>}                           A list of authIds.
   */
  async list(): Promise<Array<string>> {
    const authMap = await this.#threeIdx.getAuthMap()
    return Promise.all(
      Object.values(authMap).map(async ({ id }: AuthData): Promise<string> => {
        return await decryptAuthId(id as WrappedJWE, this.#keyring)
      })
    )
  }

  /**
   * Add a new authentication method (adds to staging).
   *
   * @param     {String}            authId          An identifier for the auth method
   * @param     {Uint8Array}        authSecret      The authSecret to use, should be of sufficient entropy
   */
  async add(authId: string, authSecret: Uint8Array): Promise<void> {
    this.#pendingAdds.push({
      authId,
      entry: await newAuthEntry(this.#keyring, this.#threeIdx.id, authId, authSecret),
    })
  }

  /**
   * Remove an authentication method (adds to staging).
   *
   * @param     {String}            authId          An identifier for the auth method
   */
  remove(authId: string): Promise<void> {
    this.#pendingRms.push(authId)
    return Promise.resolve()
  }

  /**
   * Show the staging status of the keychain.
   * Since removing auth methods will rotate the keys of the 3ID its a good idea
   * to remove multiple auth methods at once if desired. Therefore we introduce
   * a commit pattern to do multiple updates to the keychain at once.
   *
   * @return    {KeychainStatus}                    Object that states the staging status of the keychain
   */
  status(): KeychainStatus {
    return {
      clean: !(this.#pendingAdds.length + this.#pendingRms.length),
      adding: this.#pendingAdds.map((e) => e.authId),
      removing: this.#pendingRms,
    }
  }

  /**
   * Commit the staged changes to the keychain.
   */
  async commit(): Promise<void> {
    if (!this.#pendingAdds.length && !this.#pendingRms.length) throw new Error('Nothing to commit')
    const authMap = await this.#threeIdx.getAuthMap()
    if (Object.keys(authMap).length === 0) {
      if (this.#pendingRms.length) throw new Error('Can not remove non-existent auth method')
      if (!this.#pendingAdds.length) throw new Error('Can not add non-existent auth method')
      // Create IDX structure if not present
      await this.#threeIdx.createIDX(this.#pendingAdds.pop()?.entry)
    }
    if (this.#pendingRms.length) {
      await rotateKeys(this.#threeIdx, this.#keyring, this.#pendingRms)
      this.#pendingRms = []
    }
    if (this.#pendingAdds.length) {
      const entries = this.#pendingAdds.map((e) => e.entry)
      this.#pendingAdds = []
      await this.#threeIdx.addAuthEntries(entries)
    }
  }

  static async load(
    threeIdx: ThreeIDX,
    authSecret: Uint8Array,
    makeTmpProvider: (keyring: Keyring, managementKey: string) => DidProvider
  ): Promise<Keychain> {
    const did = await authSecretToDID(authSecret)
    const authData = await threeIdx.loadIDX(did.id)
    if (authData) {
      if (!authData.seed?.jwe) throw new Error('Unable to find auth data')
      try {
        const decrypted = await did.decryptDagJWE(authData.seed.jwe as JWE)
        // If we have a legacy seed v03ID will be defined
        const seed = decrypted.seed as Array<number>
        const v03ID = decrypted.v03ID as string
        const keyring = new Keyring(new Uint8Array(seed), v03ID)
        await keyring.loadPastSeeds(authData.pastSeeds as Array<JWE>)
        // We might have the v03ID in the past seeds, if so we need to create the 3ID documents from the keys
        if (keyring.v03ID) {
          await threeIdx.create3idDoc(keyring.get3idState(true))
        }
        return new Keychain(keyring, threeIdx)
      } catch (e) {
        if (e instanceof Error && e.message.includes('Failed to decrypt'))
          throw new Error('Auth not allowed')
        throw e
      }
    }
    return await Keychain.create(threeIdx, makeTmpProvider)
  }

  static async loadFromSeed(
    threeIdx: ThreeIDX,
    seed: Uint8Array,
    did: string,
    makeTmpProvider: (keyring: Keyring, managementKey: string) => DidProvider
  ): Promise<Keychain> {
    await threeIdx.load3IDDoc(did)
    const keyring = new Keyring(seed)
    await threeIdx.setDIDProvider(makeTmpProvider(keyring, did))
    return new Keychain(keyring, threeIdx)
  }

  static async create(
    threeIdx: ThreeIDX,
    makeTmpProvider: (keyring: Keyring, managementKey: string) => DidProvider,
    seed?: Uint8Array,
    v03ID?: string
  ): Promise<Keychain> {
    const keyring = new Keyring(seed, v03ID)
    const docParams = keyring.get3idState(true)
    // Temporarily set DID provider to create 3ID document
    await threeIdx.setDIDProvider(makeTmpProvider(keyring, docParams.metadata.controllers[0]))
    await threeIdx.create3idDoc(docParams)
    if (v03ID) threeIdx.setV03ID(v03ID)
    return new Keychain(keyring, threeIdx)
  }
}
