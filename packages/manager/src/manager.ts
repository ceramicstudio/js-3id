import { assert } from '@3id/common'
import type { DIDProvider } from 'dids'
import { DID } from 'dids'
import type { AuthProvider, LinkProof } from '@ceramicnetwork/blockchain-utils-linking'
import CeramicClient from '@ceramicnetwork/http-client'
import type { CryptoAccountLinks } from '@datamodels/identity-accounts-crypto'
import { DIDDataStore } from '@glazed/did-datastore'
import { model as idxModel } from './__generated__/model'
import { hash } from '@stablelib/sha256'
import { TileLoader, getDeterministicQuery, keyToQuery } from '@glazed/tile-loader'
import ThreeIdProvider from '3id-did-provider'
import { fromString } from 'uint8arrays'
import KeyDidResolver from 'key-did-resolver'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { Resolver } from 'did-resolver'
import { DIDStore, LinkCache } from './stores'
import { Migrate3IDV0, legacyDIDLinkExist, get3BoxLinkProof } from './migration'
import type { AuthConfig, SeedConfig } from './types'
import { Caip10Link } from '@ceramicnetwork/stream-caip10-link'
import { CeramicApi } from '@ceramicnetwork/common'
import { waitMS } from './utils'

let CERAMIC_API = 'https://ceramic-clay.3boxlabs.com'
let DID_MIGRATION = true

typeof process !== 'undefined' &&
  (CERAMIC_API = process.env.CERAMIC_API || 'https://ceramic-clay.3boxlabs.com')
typeof process !== 'undefined' &&
  (DID_MIGRATION = process.env.MIGRATION ? process.env.MIGRATION === 'true' : true)

export class Manager {
  authProvider: AuthProvider
  store: DIDStore
  cache: LinkCache
  dataStore: DIDDataStore
  ceramic: CeramicApi
  threeIdProviders: Record<string, ThreeIdProvider>
  loader: TileLoader

  // needs work on wording for "account", did, caip10 etc
  constructor(
    authprovider: AuthProvider,
    opts: { store?: DIDStore; ceramic?: CeramicApi; cache?: LinkCache, dataStore?: DIDDataStore }
  ) {
    this.authProvider = authprovider
    this.store = opts.store || new DIDStore()
    this.cache = opts.cache || new LinkCache()
    this.ceramic = opts.ceramic || opts.dataStore?.ceramic || new CeramicClient(CERAMIC_API, { syncInterval: 30 * 60 * 1000 })
    this.loader = new TileLoader({ ceramic: this.ceramic, cache: true })
    this.dataStore = opts.dataStore || new DIDDataStore({ ceramic: this.ceramic, model: idxModel, loader: this.loader })
    this.threeIdProviders = {}
  }

  async preload(accountId: string): Promise<void> {
    const definitionIDs = Object.values(idxModel.definitions)
    const schemaQueries = Object.values(idxModel.schemas).map((val) => keyToQuery(val.split('//')[1]))
    definitionIDs.forEach((val) => void this.dataStore.getDefinition(val))
    const preloadFamilies = ['IDX', 'authLink', ...definitionIDs] 
    const did = await this.linkInNetwork(accountId)

    if (did != null) {
      const queries = await Promise.all(preloadFamilies.map(async family => {
        return await getDeterministicQuery({ controllers: [did], family })
      }))
      await this.loader.loadMany(queries.concat(schemaQueries))
    } else {
      await this.loader.loadMany(schemaQueries)
    }
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
      legacyDid = opts && 'legacyDid' in opts ? opts.legacyDid : await  Promise.race([legacyDIDLinkExist(accountId), waitMS(500)])
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
        const didProvider = this.threeIdProviders[did].getDidProvider() as DIDProvider
        const migration = new Migrate3IDV0(didProvider as any, this.dataStore)
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
    await this.store.storeDID(threeId.id, this.threeIdProviders[threeId.id].keychain._keyring.seed)
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
    const keyDidResolver = KeyDidResolver.getResolver()
    const threeIdResolver = ThreeIdResolver.getResolver(this.ceramic)
    const resolver = new Resolver({
      ...threeIdResolver,
      ...keyDidResolver,
    })
    const didInstance = new DID({ provider: didProvider, resolver: resolver })
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

    const links = Object.assign(existing, { [accountId.toString()]: accountLink.id.toUrl() })
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
    return this.store.getDIDs()
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
