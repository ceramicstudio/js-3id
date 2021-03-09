import Ceramic from '@ceramicnetwork/http-client'
import { publishIDXConfig } from '@ceramicstudio/idx-tools'
import { IDX } from '@ceramicstudio/idx'
import Manage3IDs from '../manage3IDs'
import { entropyToMnemonic } from '@ethersproject/hdnode'
import { EthereumMigrationMockAuthProvider, createEthereumAuthProvider } from '../../test/utils'
import { AuthProvider } from '../index'

let ceramic: Ceramic
let idx: IDX

// Generate deterministic eth auth providers by id
const createAuthProvider = async (id: number):Promise<AuthProvider> => {
  const idStr = id.toString()
  const entropy = `0x${'0'.repeat(64 - idStr.length)}${idStr}`
  const mn = entropyToMnemonic(entropy)
  return createEthereumAuthProvider(mn)
}

beforeAll(async () => {
  ceramic = new Ceramic('http://localhost:7777')
  await publishIDXConfig(ceramic)
  idx = new IDX({ ceramic })
})

describe('3ID Management', () => {
  test('initializes 3ID Managment', async () => {
    // auth provider create
    const authProvider = await createEthereumAuthProvider()
    const manage3ids = new Manage3IDs(authProvider, { ceramic })
  })

  test('creates/loads new did', async () => {
    // auth provider create
    const authProvider = await createAuthProvider(1)
    const accountId = (await authProvider.accountId()).toString()
    const manage3ids = new Manage3IDs(authProvider, { ceramic })
    const did = await manage3ids.createAccount()
    // expect link to be created
    const links = await idx.get('cryptoAccounts', did)
    expect(links[accountId]).toBeTruthy()
  })

  test('creates/loads existing did in network', async () => {
    const authProvider = await createAuthProvider(2)
    const manage3ids = new Manage3IDs(authProvider, { ceramic })
    const did1 = await manage3ids.createAccount()
    manage3ids.store.store.clearAll()
    const manage3ids2 = new Manage3IDs(authProvider, { ceramic })
    const did2 = await manage3ids2.createAccount()
    expect(did1).toEqual(did2)
  })

  test('creates/loads did from storage', async () => {})

  test('creates/loads did from in memory', async () => {})

  test('creates/loads and migrates a 3IDV0 did', async () => {
    // auth provider create
    const authProvider = new EthereumMigrationMockAuthProvider()
    const manage3ids = new Manage3IDs(authProvider, { ceramic })
    const did = await manage3ids.createAccount()

    // 3idv0 format
    expect(did.includes('did:3:bafy')).toBeTruthy()

    // profile migrate
    const migratedProfile = await idx.get('basicProfile', did)
    expect(migratedProfile).toMatchSnapshot()

    // link migrated
    const links = await idx.get('cryptoAccounts', did)
    expect(links).toMatchSnapshot()

    // twitter & github migrated
    const aka = await idx.get('alsoKnownAs', did)
    expect(aka.accounts[0].claim).toMatchSnapshot()
    expect(aka.accounts[1].claim).toMatchSnapshot()
  })

  test('setDid throws if not available locally', async () => {
    const authProvider = await createAuthProvider(1)
    const accountId = (await authProvider.accountId()).toString()
    const manage3ids = new Manage3IDs(authProvider, { ceramic })
    const did = 'did:3:kjzl6cwe1jw146eidnvzjnhxfebcovtiote32s2w5zj519kj3ja8nbuqmq5884a'
    expect(manage3ids.setDid(did)).rejects.toThrow('Account does not exist')
  })

  test('setDid returns with in memory did', async () => {
    const authProvider = await createAuthProvider(1)
    const accountId = (await authProvider.accountId()).toString()
    const manage3ids = new Manage3IDs(authProvider, { ceramic })
    const did = await manage3ids.createAccount()
    const provider = await manage3ids.setDid(did)
    expect(provider).toBeTruthy()
    expect(manage3ids.ceramic.did?.id).toEqual(did)
  })

  test('setDid returns with did from store', async () => {
    const authProvider = await createAuthProvider(3)
    const manage3ids = new Manage3IDs(authProvider, { ceramic })
    const did = await manage3ids.createAccount()
    const manage3ids2 = new Manage3IDs(authProvider, { ceramic })
    const provider = await manage3ids2.setDid(did)
    expect(provider).toBeTruthy()
    expect(manage3ids.ceramic.did?.id).toEqual(did)
  })

  test('addAuthAndLink to existing did', async () => {
    const authProvider = await createAuthProvider(4)
    const manage3ids = new Manage3IDs(authProvider, { ceramic })
    manage3ids.store.store.clearAll()
    const accountId1 = (await authProvider.accountId()).toString()
    const did1 = await manage3ids.createAccount()
    const authProvider2 = await createAuthProvider(5)
    const accountId2 = (await authProvider2.accountId()).toString()
    const manage3ids2 = new Manage3IDs(authProvider2, { ceramic })
    await manage3ids2.addAuthAndLink(did1)

    // expect two links to exist now
    const links = await idx.get('cryptoAccounts', did1)
    expect(links[accountId1]).toBeTruthy()
    expect(links[accountId2]).toBeTruthy()

    // expect 1 did in, may not work in moment
    const didlist = manage3ids2.listDIDS()
    expect(didlist?.length === 1).toBeTruthy()
    expect(didlist?.includes(did1)).toBeTruthy()
  })

  // TEST state more statestore after
})
