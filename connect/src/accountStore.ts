import store from 'store'
import { assert } from './errors'
import { fromHex } from './utils'
import type { AccountsList, DIDLinksList } from './types'

const ACCOUNT_KEY = 'accounts'
const LINK_KEY = 'links'

// TODO, AccountStore will change, just pulls out existing functions, and will likely later take an
// leveldown interface as a store, also all will likely become async funcs
export class AccountStore {
  store: StoreJsAPI

  constructor(localStore?: StoreJsAPI) {
    this.store = localStore || store
  }

  storeAccount(accountId: string, authSecretHex: string): void {
    const accounts = this.getStoredAccounts()
    accounts[accountId] = authSecretHex
    this.store.set(ACCOUNT_KEY, accounts)
  }

  getStoredAccount(accountId: string): Uint8Array | null {
    const accounts = this.getStoredAccounts()
    return accounts[accountId] ? fromHex(accounts[accountId]) : null
  }

  getStoredAccounts(): Record<string, string> {
    return (this.store.get(ACCOUNT_KEY) as Record<string, string> | undefined) || {}
  }

  getStoredAccountByDid(did: string): Uint8Array {
    const links = this.getDIDLinks(did) || []
    const accounts = this.getStoredAccounts()
    const accountId = links.find((e) => Boolean(accounts[e]))
    assert.isString(accountId, 'Account does not exist')
    return fromHex(accounts[accountId])
  }

  getStoredAccountList(): Array<string> | null {
    const val = this.store.get(ACCOUNT_KEY) as Record<string, string> | undefined
    return val ? Object.keys(val) : null
  }

  storeDIDLinks(did: string, linkArray: Array<string> = []): void {
    const dids = this.getDIDLinksList()
    const didsArr = dids[did] || []
    const arr = didsArr.concat(linkArray.filter((i) => didsArr.indexOf(i) < 0))
    dids[did] = arr
    this.store.set(LINK_KEY, dids)
  }

  getDIDLinks(did: string): AccountsList | undefined {
    const dids = this.getDIDLinksList()
    return dids[did]
  }

  getDIDLinksList(): DIDLinksList {
    return (this.store.get(LINK_KEY) as DIDLinksList | undefined) || {}
  }

  getDIDs(): Array<string> | null {
    const val = this.store.get(LINK_KEY) as DIDLinksList | undefined
    return val ? Object.keys(val) : null
  }
}
