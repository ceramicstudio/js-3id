/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import { assert } from '@3id/common'
import { ThreeIdProvider } from '@3id/did-provider'
import { type CryptoAccountLinks, aliases as idxAliases } from '@3id/model'
import { getResolver as get3IDResolver } from '@ceramicnetwork/3id-did-resolver'
import type { AuthProvider, LinkProof } from '@ceramicnetwork/blockchain-utils-linking'
import { CeramicApi, toLegacyAccountId } from '@ceramicnetwork/common'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { Caip10Link } from '@ceramicnetwork/stream-caip10-link'
import { DIDDataStore } from '@glazed/did-datastore'
import { hash } from '@stablelib/sha256'
import { Resolver } from 'did-resolver'
import { DID, type DIDProvider } from 'dids'
import { getResolver as getKeyResolver } from 'key-did-resolver'
import { fromString } from 'uint8arrays'

import { Migrate3IDV0, legacyDIDLinkExist, get3BoxLinkProof } from './migration.js'
import { DIDStore, LinkCache } from './stores.js'
import type { AuthConfig, SeedConfig } from './types.js'
import { waitMS } from './utils.js'

let CERAMIC_API = 'https://ceramic-clay.3boxlabs.com'
let DID_MIGRATION = false

typeof process !== 'undefined' &&
  (CERAMIC_API = process.env.CERAMIC_API || 'https://ceramic-clay.3boxlabs.com')
typeof process !== 'undefined' &&
  (DID_MIGRATION = process.env.MIGRATION ? process.env.MIGRATION === 'true' : false)

export class Manager {
  authProvider: AuthProvider
  store: DIDStore
  cache: LinkCache
  dataStore: DIDDataStore
  ceramic: CeramicApi
  threeIdProviders: Record<string, ThreeIdProvider>

  // needs work on wording for "account", did, caip10 etc
  constructor(
    authprovider: AuthProvider,
    opts: { store?: DIDStore; ceramic?: CeramicApi; cache?: LinkCache; dataStore?: DIDDataStore }
  ) {
    this.authProvider = authprovider
    this.store = opts.store || new DIDStore()
    this.cache = opts.cache || new LinkCache()
    this.dataStore =
      opts.dataStore ||
      new DIDDataStore({
        ceramic: opts.ceramic || new CeramicClient(CERAMIC_API),
        model: idxAliases,
      })
    this.ceramic = opts.ceramic || this.dataStore.ceramic
    this.threeIdProviders = {}
  }

  // Create DID
  async createAccount(opts?: { legacyDid?: string; skipMigration?: boolean }): Promise<string> {
    const migrate = DID_MIGRATION && !opts?.skipMigration
    // If in memory return
    const accountId = (await this.authProvider.accountId()).toString()
    if (this.threeIdProviders[accountId]) return this.threeIdProviders[accountId].id

    try {
      const provider = await this.setDidByAccountId(accountId)
      return provider.id
    } catch (e) {
      // if not available, continue
    }

    const didNetwork = await this.linkInNetwork(accountId)

    try {
      if (!didNetwork) throw new Error('Expects didNetwork Link')
      const provider = await this.setDid(didNetwork)
      return provider.id
    } catch (e) {
      // if not available, continue
    }

    // Account not local if not loaded already by now
    const authSecret = await this._authCreate()

    // Look up if migration neccessary, if so auth create migration
    let legacyDid, seed, legacyConfig, migrating, authSecretAdd
    if (migrate) {
      legacyDid =
        opts && 'legacyDid' in opts
          ? opts.legacyDid
          : await Promise.race([legacyDIDLinkExist(accountId), waitMS(500)])
      if (legacyDid && !didNetwork) {
        seed = await Migrate3IDV0.legacySeedCreate(this.authProvider)
        authSecretAdd = authSecret
        legacyConfig = { v03ID: legacyDid, seed } as SeedConfig
        migrating = true
      }
    }

    const configId = migrating
      ? (legacyConfig as SeedConfig)
      : ({ authSecret, authId: accountId } as AuthConfig)
    assert.isDefined<SeedConfig | AuthConfig>(configId, 'Identity Config to initialize identity')
    const did = await this._initIdentity(configId)

    let linkProof
    if (migrating && legacyDid) {
      // if data or link fails, continue, can create new link instead and add data later if necessary
      try {
        const didProvider = this.threeIdProviders[did].getDidProvider()
        const migration = new Migrate3IDV0(didProvider, this.dataStore)
        const promChain = async (): Promise<void> => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const profile3Box = await migration.migrate3BoxProfile(did)
          await migration.migrateAKALinks(did, profile3Box)
        }
        const res = await Promise.all([get3BoxLinkProof(did), promChain()])
        linkProof = res[0]
      } catch (e) {
        console.error(e)
      }
    }

    // if auth secrete add
    if (authSecretAdd) {
      await this._addAuthMethod(did, authSecretAdd)
    }

    await this._addLink(did, linkProof)

    return did
  }

  async _initIdentity(config: AuthConfig | SeedConfig): Promise<string> {
    // Same request relayed before idw handles it, if request reaches idw, then permission given
    const getPermission = () => Promise.resolve([])

    const threeIdConfig = Object.assign(config, {
      getPermission,
      ceramic: this.ceramic,
    })
    const threeId = await ThreeIdProvider.create(threeIdConfig)
    this.threeIdProviders[threeId.id] = threeId
    await this.store.storeDID(threeId.id, this.threeIdProviders[threeId.id].keychain.keyring.seed)
    return threeId.id
  }

  // internal for now, until auth/link not strictly required together
  async _addAuthMethod(did: string, authSecretAdd: Uint8Array): Promise<void> {
    const threeId = await this.setDid(did)
    const accountId = (await this.authProvider.accountId()).toString()
    await threeId.keychain.add(accountId, authSecretAdd)
    await threeId.keychain.commit()
  }

  async _authCreate(): Promise<Uint8Array> {
    const message = 'Allow this account to control your identity'
    const authSecret = await this.authProvider.authenticate(message)
    const entropy = hash(fromString(authSecret.slice(2)))
    return entropy
  }

  async setDid(did: string): Promise<ThreeIdProvider> {
    if (!this.threeIdProviders[did]) {
      const seed = await this.store.getStoredDID(did)
      assert.isDefined(seed, 'Account does not exist')
      await this._initIdentity({ seed, did } as SeedConfig)
    }

    const didProvider = this.threeIdProviders[did].getDidProvider()
    const resolver = new Resolver({ ...get3IDResolver(this.ceramic), ...getKeyResolver() })
    const didInstance = new DID({ provider: didProvider, resolver })
    await didInstance.authenticate()
    // TODO should be same instance
    await this.ceramic.setDID(didInstance)
    await this.dataStore.ceramic.setDID(didInstance)

    return this.threeIdProviders[did]
  }

  async setDidByAccountId(accountId: string): Promise<ThreeIdProvider> {
    const did = await this.cache.getLinkedDid(accountId)
    assert.isDefined(did, 'Account does not exist')
    return this.setDid(did)
  }

  // internal for now, until auth/link not strictly required together
  async _addLink(did: string, linkProof?: LinkProof | null): Promise<void> {
    const accountId = await this.authProvider.accountId()
    await this.setDid(did)

    const existing: CryptoAccountLinks = (await this.dataStore.get('cryptoAccounts')) || {}
    if (existing && existing[accountId.toString()]) return

    if (!linkProof) {
      linkProof = await this.authProvider.createLink(did)
    }
    const accountLink = await Caip10Link.fromAccount(this.ceramic, accountId, {
      anchor: false,
      publish: false,
    })
    await accountLink.setDidProof(linkProof)
    await this.ceramic.pin.add(accountLink.id)
    const links = Object.assign(existing, {
      [toLegacyAccountId(accountId.toString())]: accountLink.id.toUrl(),
    })
    await this.dataStore.set('cryptoAccounts', links)
    await this.cache.setLinkedDid(accountId.toString(), did)
  }

  // add an AccountID to an existing DID (auth method and link)
  async addAuthAndLink(did: string): Promise<void> {
    await this._addLink(did) // did
    const authSecret = await this._authCreate()
    await this._addAuthMethod(did, authSecret)
  }

  // return did if a link exist for AccountId/caip10 in network, otherwise null
  async linkInNetwork(accountId: string): Promise<string | null> {
    try {
      const accountLink = await Caip10Link.fromAccount(this.ceramic, accountId, {
        anchor: false,
        publish: false,
      })
      const did = accountLink.did
      if (!did) throw new Error('Link not found')
      if (await this.didExist(did)) {
        await this.cache.setLinkedDid(accountId, did)
      }
      return did
    } catch (e) {
      return null
    }
  }

  // returns a list of dids of available in store
  async listDIDS(): Promise<Array<string>> {
    return await this.store.getDIDs()
  }

  // return true if did account exist in store
  async didExist(did: string): Promise<boolean> {
    const list = await this.listDIDS()
    return Boolean(list && list.includes(did))
  }

  didProvider(did: string): DIDProvider | undefined {
    return this.threeIdProviders[did]?.getDidProvider() as DIDProvider
  }
}
