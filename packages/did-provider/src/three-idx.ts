/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument,  @typescript-eslint/no-unsafe-return */
import {
  type AuthData,
  type JWE,
  type ModelTypes,
  type WrappedJWE,
  aliases as idxAliases,
} from '@3id/model'
import { getResolver as get3IDResolver } from '@ceramicnetwork/3id-did-resolver'
import type { CeramicApi, CeramicCommit } from '@ceramicnetwork/common'
import { SubscriptionSet } from '@ceramicnetwork/common'
import type { StreamID } from '@ceramicnetwork/streamid'
import type { TileDocument } from '@ceramicnetwork/stream-tile'
import { DIDDataStore } from '@glazed/did-datastore'
import { TileLoader } from '@glazed/tile-loader'
import CID from 'cids'
import { Resolver } from 'did-resolver'
import { CreateJWSOptions, DID } from 'dids'
import { getResolver as getKeyResolver } from 'key-did-resolver'

import type { DidProvider } from './did-provider.js'
import type { ThreeIdState } from './keyring.js'
import { isDefined } from './utils.js'

const isLegacyDid = (didId: string): boolean => {
  try {
    new CID(didId)
    return true
  } catch (e) {
    return false
  }
}

export interface EncKeyMaterial {
  seed: WrappedJWE
  pastSeeds: Array<JWE>
}

export interface AuthMap {
  [did: string]: AuthData
}

export interface NewAuthEntry {
  mapEntry: AuthMap
  did: DID
}

interface AuthLinkDocUpdate {
  commit: CeramicCommit
  docid: StreamID
  did: string
}

export class ThreeIDX {
  #ceramic: CeramicApi
  #dataStore: DIDDataStore<ModelTypes>
  #authLinks: Record<string, Promise<TileDocument<{ did: string } | null | undefined>>> = {}
  #v03ID?: string
  #threeIDDoc?: TileDocument<Record<string, any> | null | undefined>
  #subscriptionSet: SubscriptionSet
  resolver: Resolver

  constructor(ceramic: CeramicApi, loader?: TileLoader) {
    this.#ceramic = ceramic
    this.#dataStore = new DIDDataStore({
      ceramic,
      loader: loader ?? new TileLoader({ ceramic, cache: true }),
      model: idxAliases,
    })
    this.#subscriptionSet = new SubscriptionSet()
    this.resolver = new Resolver({ ...getKeyResolver(), ...get3IDResolver(this.#ceramic) })
  }

  get authLinks(): Record<string, Promise<TileDocument<{ did: string } | null | undefined>>> {
    return this.#authLinks
  }

  get dataStore(): DIDDataStore<ModelTypes> {
    return this.#dataStore
  }

  get threeIDDoc(): TileDocument<Record<string, any> | null | undefined> {
    if (this.#threeIDDoc == null) {
      throw new Error('3ID document is not attached')
    }
    return this.#threeIDDoc
  }

  get id(): string {
    return this.#v03ID || `did:3:${this.threeIDDoc.id.baseID.toString()}`
  }

  setV03ID(did: string): void {
    this.#v03ID = did
  }

  async setDIDProvider(provider: DidProvider): Promise<void> {
    const did = new DID({ provider, resolver: this.resolver })
    await did.authenticate()
    this.#ceramic.did = did
  }

  async create3idDoc(docParams: ThreeIdState): Promise<void> {
    if (docParams.content == null) {
      this.#threeIDDoc = await this.#dataStore.loader.deterministic(docParams.metadata, {
        anchor: false,
        publish: false,
      })
      await this.#ceramic.pin.add(this.threeIDDoc.id)
    } else {
      this.#threeIDDoc = await this.#dataStore.loader.create(
        docParams.content,
        docParams.metadata,
        { anchor: false, publish: false, pin: true }
      )
    }
    this.#subscriptionSet.add(this.threeIDDoc.subscribe())
  }

  get3idVersion(): string {
    const anchorCommitIds = this.threeIDDoc.anchorCommitIds
    const docId = anchorCommitIds[anchorCommitIds.length - 1]
    return docId ? docId.commit.toString() : '0'
  }

  async loadAuthLink(did: string): Promise<TileDocument<{ did: string } | null | undefined>> {
    const existing = this.#authLinks[did]
    if (existing != null) {
      return await existing
    }

    this.#authLinks[did] = this.#dataStore.loader.deterministic(
      { controllers: [did], family: 'authLink' },
      { anchor: false, publish: false }
    )
    const stream = await this.#authLinks[did]
    this.#subscriptionSet.add(stream.subscribe())
    return stream
  }

  async createAuthLinkUpdate({ did }: NewAuthEntry): Promise<AuthLinkDocUpdate> {
    const didString = did.id
    const tile = await this.loadAuthLink(didString)
    await this.#ceramic.pin.add(tile.id)
    const commit = await tile.makeCommit({ did }, { did: this.id })
    return {
      commit: commit,
      docid: tile.id,
      did: didString,
    }
  }

  async applyAuthLinkUpdate({ docid, commit, did }: AuthLinkDocUpdate): Promise<void> {
    if (this.#authLinks[did] != null) {
      const link = await this.#authLinks[did]
      if (link.content?.did !== this.id) {
        await this.#ceramic.applyCommit(docid, commit)
        await link.sync()
      }
    }
  }

  /**
   * Create a new IDX structure that has a given authEntry in it's keychain.
   */
  async createIDX(newEntry?: NewAuthEntry): Promise<void> {
    const docUpdatePromise = newEntry ? this.createAuthLinkUpdate(newEntry) : Promise.resolve(null)
    await this.updateKeychainDoc(newEntry?.mapEntry)
    // Only update the link document after the keychain have been updated.
    const docUpdate = await docUpdatePromise
    if (docUpdate) {
      await this.applyAuthLinkUpdate(docUpdate)
    }
  }

  /**
   * Returns the encrypted JWE for the given authLink
   */
  async loadIDX(authDid: string): Promise<EncKeyMaterial | null> {
    const did = (await this.loadAuthLink(authDid)).content?.did
    if (did == null) return null
    const keychainRecord = await this.#dataStore.get('threeIdKeychain', did)
    if (!isDefined(keychainRecord)) return null
    await this.load3IDDoc(did)
    const { authMap, pastSeeds } = keychainRecord
    return {
      seed: authMap?.[authDid]?.data,
      pastSeeds,
    } as EncKeyMaterial
  }

  async load3IDDoc(did: string): Promise<void> {
    const id = did.split(':')[2]
    if (isLegacyDid(id)) {
      // we have to load the document later when keys are loaded
      this.#v03ID = did
    } else {
      this.#threeIDDoc = await this.#dataStore.loader.load(id)
      this.#subscriptionSet.add(this.threeIDDoc.subscribe())
    }
  }

  /**
   * Adds a new AuthEntries to the Auth keychain.
   */
  async addAuthEntries(newEntries: Array<NewAuthEntry>): Promise<void> {
    const linkDocUpdatesPromise = Promise.all(
      newEntries.map(async (entry) => await this.createAuthLinkUpdate(entry))
    )
    const keychainRecord = await this.#dataStore.get('threeIdKeychain')
    const authMap = keychainRecord?.authMap ?? {}
    const newAuthEntries = newEntries.reduce(
      (acc, { mapEntry }) => ({ ...acc, ...mapEntry }),
      {} as AuthMap
    )
    const [updates] = await Promise.all([
      linkDocUpdatesPromise,
      this.updateKeychainDoc({ ...authMap, ...newAuthEntries }, keychainRecord?.pastSeeds),
    ])
    await Promise.all(updates.map(async (update) => await this.applyAuthLinkUpdate(update)))
  }

  /**
   * Returns all public keys that is in the auth keychain.
   */
  async getAuthMap(): Promise<AuthMap> {
    return (await this.#dataStore.get('threeIdKeychain'))?.authMap ?? {}
  }

  async updateKeychainDoc(authMap: AuthMap = {}, pastSeeds: Array<JWE> = []): Promise<void> {
    if (Object.keys(authMap).length !== 0) {
      await this.#dataStore.set('threeIdKeychain', { authMap, pastSeeds })
    }
  }

  /**
   * Perform a key rotation.
   * Will update the keys in the 3id document, and create a new 3ID keychain
   * with the given authEntries.
   */
  async rotateKeys(
    threeIdState: ThreeIdState,
    pastSeeds: Array<JWE>,
    authMap: AuthMap
  ): Promise<void> {
    if (!threeIdState.content) throw new Error('Content has to be defined')

    const threeID = this.threeIDDoc

    const currentController = threeID.controllers[0]
    // Sign an update to 3ID document with did:key
    const didKey = new Proxy(this.#ceramic.did!, {
      get(target: DID, prop: string | symbol, receiver?: any): any {
        // Only intercept ::createJWS function. Make it sign with the current controller.
        if (prop === 'createJWS') {
          return <T = any>(payload: T, options: CreateJWSOptions = {}) => {
            return target.createJWS(payload, { ...options, did: currentController })
          }
        } else {
          // Idiomatic way to fall back to the original method/property.
          return Reflect.get(target, prop, receiver)
        }
      },
    })
    // Rotate keys in 3ID document and update keychain
    await threeID.update(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { ...threeID.content, publicKeys: threeIdState.content.publicKeys },
      threeIdState.metadata,
      { asDID: didKey }
    )
    await this.updateKeychainDoc(authMap, pastSeeds)
  }
}
