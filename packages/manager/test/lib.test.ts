import { EventEmitter } from 'events'
import { AuthProviderClient, createAuthProviderServer } from '@3id/iframe-auth-provider'
import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import type { AuthProvider, LinkProof } from '@ceramicnetwork/blockchain-utils-linking'
import type { CeramicApi } from '@ceramicnetwork/common'
import Ceramic from '@ceramicnetwork/http-client'
import { IDX } from '@ceramicstudio/idx'
import { publishIDXConfig } from '@ceramicstudio/idx-tools'
import { entropyToMnemonic } from '@ethersproject/hdnode'
import { Wallet as EthereumWallet } from '@ethersproject/wallet'
import { AccountID } from 'caip'
import { fromString, toString } from 'uint8arrays'

import { Manager } from '../src'

declare global {
  const ceramic: CeramicApi
}
class EthereumProvider extends EventEmitter {
  wallet: EthereumWallet

  constructor(wallet: EthereumWallet) {
    super()
    this.wallet = wallet
  }

  send(
    request: { method: string; params: Array<any> },
    callback: (err: Error | null | undefined, res?: any) => void
  ) {
    if (request.method === 'eth_chainId') {
      callback(null, { result: '1' })
    } else if (request.method === 'personal_sign') {
      let message = request.params[0] as string
      if (message.startsWith('0x')) {
        message = toString(fromString(message.slice(2), 'base16'), 'utf8')
      }
      callback(null, { result: this.wallet.signMessage(message) })
    } else {
      callback(new Error(`Unsupported method: ${request.method}`))
    }
  }
}

class EthereumMigrationMockAuthProvider implements AuthProvider {
  accountId() {
    return Promise.resolve(
      new AccountID({
        address: '0x5314846209d781caad6258b0de7c13acb99ef692',
        chainId: `eip155:1`,
      })
    )
  }

  authenticate(message: string): Promise<string> {
    if (message === 'Add this account as a Ceramic authentication method') {
      return Promise.resolve('0xe80f049f93bd9ad99b24ba7cea21271eea92e493bf01e0633821c29760f69381')
    } else if (message === 'This app wants to view and update your 3Box profile.') {
      return Promise.resolve('0xda87c0f5ff9d1237f0cf7eeb0d6507e8144038d56ccac1c7479df7bf95f20015')
    } else {
      throw new Error('Mock message signature not supported')
    }
  }

  createLink(_did: string): Promise<LinkProof> {
    throw new Error('CreateLink not required in migration')
  }
}

// TODO moved shared test utils, after repo reorg
function createEthereumAuthProvider(mnemonic?: string): Promise<EthereumAuthProvider> {
  const wallet = mnemonic ? EthereumWallet.fromMnemonic(mnemonic) : EthereumWallet.createRandom()
  const provider = new EthereumProvider(wallet)
  return Promise.resolve(new EthereumAuthProvider(provider, wallet.address))
}

// Generate deterministic eth auth providers by id
const createAuthProvider = async (id: number): Promise<AuthProvider> => {
  const idStr = id.toString()
  const entropy = `0x${'0'.repeat(64 - idStr.length)}${idStr}`
  const mn = entropyToMnemonic(entropy)
  return createEthereumAuthProvider(mn)
}

describe('3ID Manager', () => {
  jest.setTimeout(30000)

  let ceramic, idx
  beforeAll(async () => {
    ceramic = new Ceramic()
    await publishIDXConfig(ceramic)
    idx = new IDX({ ceramic })
  })

  test('creates/loads new did', async () => {
    // auth provider create
    const authProvider = await createAuthProvider(1)
    const accountId = (await authProvider.accountId()).toString()
    const manager = new Manager(authProvider, { ceramic })
    const did = await manager.createAccount()
    // expect link to be created
    const links = await idx.get('cryptoAccounts', did)
    expect(links[accountId]).toBeTruthy()
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

  test('creates/loads did from storage', async () => {})

  test('creates/loads did from in memory', async () => {})

  test.skip('creates/loads did with a RPC authprovider', async () => {
    const ethAuthProvider = await createAuthProvider(6)
    const server = createAuthProviderServer(ethAuthProvider).subscribe()
    //this makes target source same (but using cross origin server, normally window.parent)
    const authProvider = new AuthProviderClient(window)
    const accountId = (await authProvider.accountId()).toString()
    const manager = new Manager(authProvider, { ceramic })
    const did = await manager.createAccount()
    const links = await idx.get('cryptoAccounts', did)
    expect(links[accountId]).toBeTruthy()
    server.unsubscribe()
  })

  test('creates/loads and migrates a 3IDV0 did', async () => {
    // auth provider create
    const authProvider = new EthereumMigrationMockAuthProvider()
    const manager = new Manager(authProvider, { ceramic })
    const did = await manager.createAccount()

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

  test('addAuthAndLink to existing did', async () => {
    const authProvider = await createAuthProvider(4)
    const manager = new Manager(authProvider, { ceramic })
    manager.store.store.clearAll()
    const accountId1 = (await authProvider.accountId()).toString()
    const did1 = await manager.createAccount()
    const authProvider2 = await createAuthProvider(5)
    const accountId2 = (await authProvider2.accountId()).toString()
    const manager2 = new Manager(authProvider2, { ceramic })
    await manager2.addAuthAndLink(did1)

    // expect two links to exist now
    const links = await idx.get('cryptoAccounts', did1)
    expect(links[accountId1]).toBeTruthy()
    expect(links[accountId2]).toBeTruthy()

    // expect 1 did in, may not work in moment
    const didlist = manager2.listDIDS()
    expect(didlist?.length === 1).toBeTruthy()
    expect(didlist?.includes(did1)).toBeTruthy()
  })

  // TEST state more statestore after
})
