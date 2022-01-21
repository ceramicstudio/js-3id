import * as u8a from 'uint8arrays'
import { randomBytes } from '@stablelib/random'
import { jest } from '@jest/globals'

import { Keychain, newAuthEntry } from '../src/keychain'
import { Keyring } from '../src/keyring'
import { AuthMap, NewAuthEntry, ThreeIDX } from '../src/three-idx'

const seed = u8a.fromString(
  '8e641c0dc77f6916cc7f743dad774cdf9f6f7bcb880b11395149dd878377cd398650bbfd4607962b49953c87da4d7f3ff247ed734b06f96bdd69479377bc612b',
  'base16'
)
const randomAuthSecret = () => randomBytes(32)
const makeTmpProvider = jest.fn()

describe('Keychain', () => {
  let keyring: Keyring
  let threeIdx: ThreeIDX

  beforeAll(() => {
    keyring = new Keyring(seed)
  })

  beforeEach(() => {
    const authMap: AuthMap = {}
    threeIdx = {
      id: 'did:3:asdf',
      loadIDX: jest.fn(() => Promise.resolve(null)),
      setDIDProvider: jest.fn(),
      create3idDoc: jest.fn(),
      createIDX: jest.fn((entry?: NewAuthEntry) => {
        Object.assign(authMap, entry!.mapEntry)
        return Promise.resolve()
      }),
      addAuthEntries: jest.fn((entries: Array<NewAuthEntry>) => {
        entries.map((entry) => Object.assign(authMap, entry.mapEntry))
        return Promise.resolve()
      }),
      getAuthMap: jest.fn(() => authMap),
      get3idVersion: jest.fn(() => '0'),
      rotateKeys: jest.fn(),
      setV03ID: jest.fn(),
    } as unknown as ThreeIDX
  })

  it('Create with v03ID', async () => {
    const v03ID = 'did:3:abc234'
    const keychain = await Keychain.create(threeIdx, makeTmpProvider, randomAuthSecret(), v03ID)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(threeIdx.setDIDProvider).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(threeIdx.create3idDoc).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(threeIdx.setV03ID).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(threeIdx.setV03ID).toHaveBeenCalledWith(v03ID)
    expect(await keychain.list()).toEqual([])
    expect(keychain.keyring.v03ID).toEqual(v03ID)
  })

  it('load, no IDX present', async () => {
    const keychain = await Keychain.load(threeIdx, randomAuthSecret(), makeTmpProvider)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(threeIdx.loadIDX).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(threeIdx.setDIDProvider).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(threeIdx.create3idDoc).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(threeIdx.setV03ID).toHaveBeenCalledTimes(0)
    expect(await keychain.list()).toEqual([])
  })

  it('load, IDX present', async () => {
    const authSecret = randomAuthSecret()
    // add the auth entry to IDX
    const tmpKc = await Keychain.load(threeIdx, authSecret, makeTmpProvider)
    const newEntry = await newAuthEntry(tmpKc.keyring, threeIdx.id, 'authid', authSecret)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    await threeIdx.createIDX(newEntry)

    threeIdx.loadIDX = jest.fn(async () => {
      const authMap = await threeIdx.getAuthMap()
      return {
        seed: authMap[newEntry.did.id].data,
        pastSeeds: [],
      }
    })
    const keychain = await Keychain.load(threeIdx, authSecret, makeTmpProvider)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(threeIdx.loadIDX).toHaveBeenCalledTimes(1)
    expect(await keychain.list()).toEqual(['authid'])
  })

  it('load, IDX present, v03ID', async () => {
    const v03ID = 'did:3:abc234'
    const authSecret = randomAuthSecret()
    const keychain = await Keychain.create(threeIdx, makeTmpProvider, randomAuthSecret(), v03ID)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(threeIdx.setV03ID).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(threeIdx.create3idDoc).toHaveBeenCalledTimes(1)
    await keychain.add('auth1', authSecret)
    await keychain.commit()

    threeIdx.loadIDX = jest.fn(async () => {
      const authMap = await threeIdx.getAuthMap()
      return {
        seed: Object.values(authMap)[0].data,
        pastSeeds: keychain.keyring.pastSeeds,
      }
    })
    const keychain1 = await Keychain.load(threeIdx, authSecret, makeTmpProvider)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(threeIdx.create3idDoc).toHaveBeenCalledTimes(2)
    expect(keychain1.keyring.v03ID).toEqual(v03ID)
  })

  it('commit adds, no IDX created yet', async () => {
    const keychain = new Keychain(keyring, threeIdx)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(threeIdx.createIDX).toHaveBeenCalledTimes(0)
    await keychain.add('auth1', randomAuthSecret())
    await keychain.add('auth2', randomAuthSecret())
    expect(await keychain.list()).toEqual([])
    await keychain.commit()
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(threeIdx.createIDX).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(threeIdx.addAuthEntries).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(threeIdx.addAuthEntries).toHaveBeenCalledTimes(1)
    expect(await keychain.list()).toEqual(['auth2', 'auth1'])
  })

  it('commit adds, IDX already created', async () => {
    const keychain = new Keychain(keyring, threeIdx)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    await threeIdx.createIDX(
      await newAuthEntry(keychain.keyring, threeIdx.id, 'authid', randomAuthSecret())
    )

    await keychain.add('auth1', randomAuthSecret())
    await keychain.add('auth2', randomAuthSecret())
    expect(await keychain.list()).toEqual(['authid'])
    await keychain.commit()
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(threeIdx.createIDX).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(threeIdx.addAuthEntries).toHaveBeenCalledTimes(1)
    expect(await keychain.list()).toEqual(['authid', 'auth1', 'auth2'])
  })

  it('commit removes', async () => {
    const authSecret0 = randomAuthSecret()
    const authSecret1 = randomAuthSecret()
    const rotateKeys = jest.fn()
    threeIdx.rotateKeys = rotateKeys
    const keychain = new Keychain(keyring, threeIdx)
    await threeIdx.createIDX(
      await newAuthEntry(keychain.keyring, threeIdx.id, 'authid', authSecret0)
    )
    await keychain.add('auth1', authSecret1)
    await keychain.commit()

    // rotate
    await keychain.remove('authid')
    expect(await keychain.list()).toEqual(['authid', 'auth1'])
    await keychain.commit()
    threeIdx.loadIDX = jest.fn(() =>
      Promise.resolve({
        seed: Object.values(rotateKeys.mock.calls[0][2] as AuthMap)[0].data,
        pastSeeds: rotateKeys.mock.calls[0][1],
      })
    )
    // load with auth1
    await expect(Keychain.load(threeIdx, authSecret1, makeTmpProvider)).resolves.toBeTruthy()
    // failt to load with authid
    await expect(Keychain.load(threeIdx, authSecret0, makeTmpProvider)).rejects.toThrow(
      'Auth not allowed'
    )
  })

  it('add updates status', async () => {
    const keychain = await Keychain.load(threeIdx, randomAuthSecret(), makeTmpProvider)
    expect(keychain.status()).toEqual({ clean: true, adding: [], removing: [] })
    await keychain.add('auth1', randomAuthSecret())
    await keychain.add('auth2', randomAuthSecret())
    expect(keychain.status()).toEqual({
      clean: false,
      adding: ['auth1', 'auth2'],
      removing: [],
    })
    await keychain.add('auth3', randomAuthSecret())
    expect(keychain.status()).toEqual({
      clean: false,
      adding: ['auth1', 'auth2', 'auth3'],
      removing: [],
    })
  })

  it('remove updates status', async () => {
    const keychain = await Keychain.load(threeIdx, randomAuthSecret(), makeTmpProvider)
    expect(keychain.status()).toEqual({ clean: true, adding: [], removing: [] })
    await keychain.remove('auth1')
    await keychain.remove('auth2')
    expect(keychain.status()).toEqual({
      clean: false,
      adding: [],
      removing: ['auth1', 'auth2'],
    })
    await keychain.remove('auth3')
    expect(keychain.status()).toEqual({
      clean: false,
      adding: [],
      removing: ['auth1', 'auth2', 'auth3'],
    })
  })
})
