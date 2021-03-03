import Ceramic from '@ceramicnetwork/http-client'
import { publishIDXConfig } from '@ceramicstudio/idx-tools'
import { IDX } from '@ceramicstudio/idx'
import { Wallet as EthereumWallet } from '@ethersproject/wallet'
import { Manage3IDs } from '../manage3IDs'
import { fromString, toString } from 'uint8arrays'
import { AccountID } from 'caip'
import { EthereumAuthProvider, AuthProvider } from '../index'
import { EventEmitter } from 'events'
import { entropyToMnemonic } from '@ethersproject/hdnode'

//TODO needs to be configured to no run per browser

// TODO moved shared test utils, after repo reorg
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

// TODO moved shared test utils, after repo reorg
class EthereumMigrationMockAuthProvider implements AuthProvider {
  async accountId() {
    return new AccountID({
      address: '0x5314846209d781caad6258b0de7c13acb99ef692',
      chainId: `eip155:1`,
    })
  }

  async authenticate(message: string): Promise<string> {
    if (message === 'Add this account as a Ceramic authentication method') {
      return '0xe80f049f93bd9ad99b24ba7cea21271eea92e493bf01e0633821c29760f69381'
    } else if (message === 'This app wants to view and update your 3Box profile.') {
      return '0xda87c0f5ff9d1237f0cf7eeb0d6507e8144038d56ccac1c7479df7bf95f20015'
    } else {
      throw new Error('Mock message signature not supported')
    }
  }

  async createLink(did: string): Promise<LinkProof> {
    throw new Error('CreateLink not required in migration')
  }
}

// TODO moved shared test utils, after repo reorg
function createEthereumAuthProvider(mnemonic?: string): Promise<EthereumAuthProvider> {
  const wallet = mnemonic ? EthereumWallet.fromMnemonic(mnemonic) : EthereumWallet.createRandom()
  const provider = new EthereumProvider(wallet)
  return Promise.resolve(new EthereumAuthProvider(provider, wallet.address))
}

let ceramic: Ceramic
let idx: IDX

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
    const authProvider = await createEthereumAuthProvider(
      entropyToMnemonic('0x0000000000000000000000000000000000000000000000000000000000000001')
    )
    const accountId = (await authProvider.accountId()).toString()
    const manage3ids = new Manage3IDs(authProvider, { ceramic })
    const did = await manage3ids.createAccount()
    // expect link to be created
    const links = await idx.get('cryptoAccounts', did)
    expect(links[accountId]).toBeTruthy()
  })

  test('creates/loads existing did in network', async () => {
    // auth provider create
    const authProvider = await createEthereumAuthProvider(
      entropyToMnemonic('0x0000000000000000000000000000000000000000000000000000000000000002')
    )
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
    const authProvider = await createEthereumAuthProvider(
      entropyToMnemonic('0x0000000000000000000000000000000000000000000000000000000000000001')
    )
    const accountId = (await authProvider.accountId()).toString()
    const manage3ids = new Manage3IDs(authProvider, { ceramic })
    const did = 'did:3:kjzl6cwe1jw146eidnvzjnhxfebcovtiote32s2w5zj519kj3ja8nbuqmq5884a'
    expect(manage3ids.setDid(did)).rejects.toThrow('Account does not exist')
  })

  test('setDid returns with in memory did', async () => {
    const authProvider = await createEthereumAuthProvider(
      entropyToMnemonic('0x0000000000000000000000000000000000000000000000000000000000000001')
    )
    const accountId = (await authProvider.accountId()).toString()
    const manage3ids = new Manage3IDs(authProvider, { ceramic })
    const did = await manage3ids.createAccount()
    const provider = await manage3ids.setDid(did)
    expect(provider).toBeTruthy()
    expect(manage3ids.ceramic.did?.id).toEqual(did)
  })

  test('setDid returns with did from store', async () => {
    const authProvider = await createEthereumAuthProvider(
      entropyToMnemonic('0x0000000000000000000000000000000000000000000000000000000000000003')
    )
    const manage3ids = new Manage3IDs(authProvider, { ceramic })
    const did = await manage3ids.createAccount()
    const manage3ids2 = new Manage3IDs(authProvider, { ceramic })
    const provider = await manage3ids2.setDid(did)
    expect(provider).toBeTruthy()
    expect(manage3ids.ceramic.did?.id).toEqual(did)
  })

  test('addAuthAndLink to existing did', async () => {
    const authProvider = await createEthereumAuthProvider(
      entropyToMnemonic('0x0000000000000000000000000000000000000000000000000000000000000004')
    )
    const manage3ids = new Manage3IDs(authProvider, { ceramic })
    manage3ids.store.store.clearAll()
    const accountId1 = (await authProvider.accountId()).toString()
    const did1 = await manage3ids.createAccount()
    const authProvider2 = await createEthereumAuthProvider(
      entropyToMnemonic('0x0000000000000000000000000000000000000000000000000000000000000005')
    )
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
