/**
 * @jest-environment 3id
 */
/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument*/
import { aliases as idxAliases } from '@3id/model'
import { EthereumMigrationMockAuthProvider, createAuthProvider } from '@3id/test-utils'
import { AuthProviderClient, createAuthProviderServer } from '@3id/window-auth-provider'
import type { CeramicApi } from '@ceramicnetwork/common'
import { toLegacyAccountId } from '@ceramicnetwork/common'
import { DIDDataStore } from '@glazed/did-datastore'
import { jest } from '@jest/globals'
import { toHex } from '@3id/common'
import store from 'store'

import { Manager, DIDStore, LinkCache } from '../src'

declare global {
  const ceramic: CeramicApi
}

describe('3ID Manager', () => {
  jest.setTimeout(120000)

  const dataStore = new DIDDataStore({ ceramic, model: idxAliases })

  test('creates/loads new did', async () => {
    // auth provider create
    const authProvider = await createAuthProvider(1)
    const accountId = await authProvider.accountId()
    const manager = new Manager(authProvider, { ceramic })
    const did = await manager.createAccount()
    // expect link to be created
    const links = await dataStore.get('cryptoAccounts', did)
    expect(links[toLegacyAccountId(accountId.toString())]).toBeTruthy()
  })

  test('creates/loads existing did in network', async () => {
    const authProvider = await createAuthProvider(2)
    const manager = new Manager(authProvider, { ceramic })
    const did1 = await manager.createAccount()
    manager.store.store.clearAll()
    const manager2 = new Manager(authProvider, { ceramic })
    const did2 = await manager2.createAccount()
    expect(did1).toEqual(did2)
  })

  test.todo('creates/loads did from storage')

  test.todo('creates/loads did from in memory')

  test.skip('creates/loads did with a RPC authprovider', async () => {
    const ethAuthProvider = await createAuthProvider(6)
    const server = createAuthProviderServer(ethAuthProvider).subscribe()
    //this makes target source same (but using cross origin server, normally window.parent)
    const authProvider = new AuthProviderClient(window)
    const accountId = (await authProvider.accountId()).toString()
    const manager = new Manager(authProvider, { ceramic })
    const did = await manager.createAccount()
    const links = await dataStore.get('cryptoAccounts', did)
    expect(links[accountId]).toBeTruthy()
    server.unsubscribe()
  })

  test.skip('creates/loads and migrates a 3IDV0 did', async () => {
    // auth provider create
    const authProvider = new EthereumMigrationMockAuthProvider()
    const manager = new Manager(authProvider, { ceramic })
    const did = await manager.createAccount()

    // 3idv0 format
    expect(did.includes('did:3:bafy')).toBeTruthy()

    // profile migrate
    const migratedProfile = await dataStore.get('basicProfile', did)
    expect(migratedProfile).toMatchSnapshot()

    // link migrated
    const links = await dataStore.get('cryptoAccounts', did)
    expect(links).toMatchSnapshot()

    // twitter & github migrated
    const aka = await dataStore.get('alsoKnownAs', did)
    expect(aka.accounts[0].claim).toMatchSnapshot()
    expect(aka.accounts[1].claim).toMatchSnapshot()
  })

  test('setDid throws if not available locally', async () => {
    const authProvider = await createAuthProvider(1)
    const manager = new Manager(authProvider, { ceramic })
    const did = 'did:3:kjzl6cwe1jw146eidnvzjnhxfebcovtiote32s2w5zj519kj3ja8nbuqmq5884a'
    await expect(manager.setDid(did)).rejects.toThrow('Account does not exist')
  })

  test('setDid returns with in memory did', async () => {
    const authProvider = await createAuthProvider(1)
    const manager = new Manager(authProvider, { ceramic })
    const did = await manager.createAccount()
    const provider = await manager.setDid(did)
    expect(provider).toBeTruthy()
    expect(manager.ceramic.did?.id).toEqual(did)
  })

  test('setDid returns with did from store', async () => {
    const authProvider = await createAuthProvider(3)
    const manager = new Manager(authProvider, { ceramic })
    const did = await manager.createAccount()
    const manager2 = new Manager(authProvider, { ceramic })
    const provider = await manager2.setDid(did)
    expect(provider).toBeTruthy()
    expect(manager.ceramic.did?.id).toEqual(did)
  })

  test('setDid returns with did from store with existing CAIP10 V0 mappings', async () => {
    const authProvider = await createAuthProvider(9)
    const accountId = await authProvider.accountId()
    const caipv0 = '0x5460D2749ba58ae551683FF14CE90AB34503fa12@eip155:1'
    const didStore = new DIDStore(store)
    const linkCache = new LinkCache(store)
    const manager = new Manager(authProvider, { ceramic, store: didStore, cache: linkCache })
    const did = await manager.createAccount()
    const seedstr = toHex(await manager.store.getStoredDID(did))
    store.clearAll()
    // Expected storage mappings/schema
    store.set(`ACC_${did}`, seedstr)
    store.set(`LINK_${caipv0}`, did)
    const manager2 = new Manager(authProvider, { ceramic, store: didStore, cache: linkCache })
    const provider = await manager2.setDidByAccountId(accountId.toString())
    expect(provider).toBeTruthy()
    expect(manager2.ceramic.did?.id).toEqual(did)
  })

  test('addAuthAndLink to existing did', async () => {
    const authProvider = await createAuthProvider(4)
    const manager = new Manager(authProvider, { ceramic })
    manager.store.store.clearAll()
    const accountId1 = await authProvider.accountId()
    const did1 = await manager.createAccount()
    const authProvider2 = await createAuthProvider(5)
    const accountId2 = await authProvider2.accountId()
    const manager2 = new Manager(authProvider2, { ceramic })
    await manager2.addAuthAndLink(did1)

    // expect two links to exist now
    const links = await dataStore.get('cryptoAccounts', did1)
    expect(links[toLegacyAccountId(accountId1.toString())]).toBeTruthy()
    expect(links[toLegacyAccountId(accountId2.toString())]).toBeTruthy()

    const didlist = await manager2.listDIDS()
    expect(didlist?.length === 1).toBeTruthy()
    expect(didlist?.includes(did1)).toBeTruthy()
  })

  // TEST state more statestore after
})
