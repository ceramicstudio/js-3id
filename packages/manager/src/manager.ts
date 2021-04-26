import { assert } from '@3id/common'
import type { DIDProvider } from 'dids'
import type { AuthProvider, LinkProof } from '@ceramicnetwork/blockchain-utils-linking'
import CeramicClient from '@ceramicnetwork/http-client'
import { IDX } from '@ceramicstudio/idx'
import type { CryptoAccounts } from '@ceramicstudio/idx-constants'
import { hash } from '@stablelib/sha256'
import ThreeIdProvider from '3id-did-provider'
import { fromString } from 'uint8arrays'

import { DIDStore, LinkCache } from './stores'
import { Migrate3IDV0, legacyDIDLinkExist, get3BoxLinkProof } from './migration'
import type { AuthConfig, SeedConfig } from './types'

const CERAMIC_API = process.env.CERAMIC_API || 'https://ceramic-clay.3boxlabs.com'
const DID_MIGRATION = process.env.MIGRATION ? process.env.MIGRATION === 'true' : true // default true

export class Manager {
  authProvider: AuthProvider
  store: DIDStore
  cache: LinkCache
  idx: IDX
  ceramic: CeramicClient
  threeIdProviders: Record<string, ThreeIdProvider>

  // needs work on wording for "account", did, caip10 etc
  constructor(
    authprovider: AuthProvider,
    opts: { store?: DIDStore; ceramic?: CeramicClient; cache?: LinkCache }
  ) {
    this.authProvider = authprovider
    this.store = opts.store || new DIDStore()
    this.cache = opts.cache || new LinkCache()
    this.ceramic = opts.ceramic || new CeramicClient(CERAMIC_API)
    this.idx = new IDX({ ceramic: this.ceramic })
    this.threeIdProviders = {}
  }

  // Create DID
  async createAccount(): Promise<string> {
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
      assert.isDefined(didNetwork, 'Expects didNetwork Link')
      const provider = await this.setDid(didNetwork)
      return provider.id
    } catch (e) {
      // if not available, continue
    }

    // Account not local if not loaded already by now

    const authSecret = await this._authCreate()

    // Look up if migration neccessary, if so auth create migration
    let legacyDid, seed, legacyConfig, migrate, authSecretAdd
    if (DID_MIGRATION) {
      legacyDid = await legacyDIDLinkExist(accountId)
      if (legacyDid && !didNetwork) {
        seed = await Migrate3IDV0.legacySeedCreate(this.authProvider)
        authSecretAdd = authSecret
        legacyConfig = { v03ID: legacyDid, seed } as SeedConfig
        migrate = true
      }
    }

    const configId = migrate
      ? (legacyConfig as SeedConfig)
      : ({ authSecret, authId: accountId } as AuthConfig)
    assert.isDefined<SeedConfig | AuthConfig>(configId, 'Identity Config to initialize identity')
    const did = await this._initIdentity(configId)

    let linkProof
    if (migrate && legacyDid) {
      const didProvider = this.threeIdProviders[did].getDidProvider() as DIDProvider
      const migration = new Migrate3IDV0(didProvider as any, this.idx)
      const promChain = async (): Promise<void> => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const profile3Box = await migration.migrate3BoxProfile(did)
        await migration.migrateAKALinks(did, profile3Box)
      }
      const res = await Promise.all([get3BoxLinkProof(did), promChain()])
      linkProof = res[0]
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
    this.threeIdProviders[threeId.id] = await ThreeIdProvider.create(threeIdConfig)
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
      await this._initIdentity({ seed } as SeedConfig)
    }

    const didProvider = this.threeIdProviders[did].getDidProvider() as DIDProvider
    await this.ceramic.setDIDProvider(didProvider as any)

    return this.threeIdProviders[did]
  }

  async setDidByAccountId(accountId: string): Promise<ThreeIdProvider> {
    const did = await this.cache.getLinkedDid(accountId)
    assert.isDefined(did, 'Account does not exist')
    return this.setDid(did)
  }

  // internal for now, until auth/link not strictly required together
  async _addLink(did: string, linkProof?: LinkProof | null): Promise<void> {
    const accountId = (await this.authProvider.accountId()).toString()
    await this.setDid(did)

    const existing: CryptoAccounts = (await this.idx.get('cryptoAccounts')) || {}
    if (existing && existing[accountId]) return

    if (!linkProof) {
      linkProof = await this.authProvider.createLink(did)
    }

    const linkDoc = await this.ceramic.createDocument(
      'caip10-link',
      { metadata: { controllers: [accountId] } },
      { anchor: false, publish: false }
    )

    await linkDoc.change({ content: linkProof })
    await this.ceramic.pin.add(linkDoc.id)

    const links = Object.assign(existing, { [accountId]: linkDoc.id.toUrl() })
    await this.idx.set('cryptoAccounts', links)
    await this.cache.setLinkedDid(accountId, did)
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
      const did = await this.idx.caip10ToDid(accountId)
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
