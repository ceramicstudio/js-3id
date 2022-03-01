/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import { toHex, fromHex } from '@3id/common'
import { normalizeAccountId, toLegacyAccountId } from '@ceramicnetwork/common'
import store from 'store'

const DIDSTORE_PREFIX = 'ACC_'
const LINKCACHE_PREFIX = 'LINK_'

const didToKey = (account: string): string => `${DIDSTORE_PREFIX}${account}`
const didFromKey = (key: string): string => key.replace(DIDSTORE_PREFIX, '')

const caipToKey = (account: string): string => `${LINKCACHE_PREFIX}${toLegacyAccountId(account)}`
const caipFromKey = (key: string): string =>
  normalizeAccountId(key.replace(LINKCACHE_PREFIX, '')).toString()

export class DIDStore {
  store: StoreJsAPI

  constructor(db?: StoreJsAPI) {
    this.store = db || store
  }

  async storeDID(did: string, seed: Uint8Array): Promise<void> {
    this.store.set(didToKey(did), toHex(seed))
  }

  async getStoredDID(did: string): Promise<Uint8Array | null> {
    const account = this.store.get(didToKey(did)) as string
    return account ? fromHex(account) : null
  }

  async getDIDs(): Promise<Array<string>> {
    const res: Array<string> = []

    store.each((_v: string, k: string) => {
      if (k.startsWith(DIDSTORE_PREFIX)) res.push(didFromKey(k))
    })
    return res
  }
}

export class LinkCache {
  store: StoreJsAPI

  constructor(db?: StoreJsAPI) {
    this.store = db || store
  }

  async setLinkedDid(accountId: string, did: string): Promise<void> {
    this.store.set(caipToKey(accountId), did)
  }

  async getLinkedDid(accountId: string): Promise<string | null> {
    return (this.store.get(caipToKey(accountId)) as string) || null
  }

  async getLinkedAccounts(): Promise<Array<string> | null> {
    const res: Array<string> = []
    store.each((_v: string, k: string) => {
      if (k.startsWith(LINKCACHE_PREFIX)) res.push(caipFromKey(k))
    })
    return res
  }
}
