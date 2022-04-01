/**
 * @jest-environment 3id
 */

import type { CeramicApi } from '@ceramicnetwork/common'
import { TileLoader, type TileCache } from '@glazed/tile-loader'
import { jest } from '@jest/globals'
import { randomBytes } from '@stablelib/random'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver as getKeyResolver } from 'key-did-resolver'
import all from 'it-all'
import * as u8a from 'uint8arrays'

import { DidProvider } from '../src/did-provider'
import { Keyring } from '../src/keyring'
import { Permissions } from '../src/permissions'
import { NewAuthEntry, ThreeIDX } from '../src/three-idx'

declare global {
  const ceramic: CeramicApi
}

const seed = u8a.fromString(
  '8e641c0dc77f6916cc7f743dad774cdf9f6f7bcb880b11395149dd878377cd398650bbfd4607962b49953c87da4d7f3ff247ed734b06f96bdd69479377bc612b',
  'base16'
)

const randomSecret = () => '0x' + Buffer.from(randomBytes(32)).toString('hex')

const pauseSeconds = (sec: number) => new Promise((res) => setTimeout(res, sec * 1000))

const fakeJWE = () => ({
  jwe: {
    protected: 'prot',
    tag: 'tag',
    ciphertext: randomSecret(),
    iv: 'iv',
  },
})

async function genAuthEntryCreate(): Promise<NewAuthEntry> {
  const provider = new Ed25519Provider(randomBytes(32))
  const did = new DID({ provider, resolver: getKeyResolver() })
  await did.authenticate()
  return {
    did,
    mapEntry: {
      [did.id]: {
        data: fakeJWE(),
        id: fakeJWE(),
      },
    },
  }
}

const setup3id = async (threeIdx: ThreeIDX, keyring: Keyring) => {
  const genState = keyring.get3idState(true)
  const forcedDID = genState.metadata.controllers[0]
  let didProvider = new DidProvider({
    permissions: mockedPermissions,
    threeIdx,
    keyring,
    forcedDID,
  })
  await threeIdx.setDIDProvider(didProvider)
  await threeIdx.create3idDoc(genState)
  didProvider = new DidProvider({ permissions: mockedPermissions, threeIdx, keyring })
  await threeIdx.setDIDProvider(didProvider)
}

const mockedPermissions = {
  request: () => Promise.resolve([]),
  has: () => true,
} as unknown as Permissions

describe('ThreeIDX', () => {
  jest.setTimeout(360000)

  const anchorService = ceramic.context.anchorService
  let cache: TileCache
  let keyring: Keyring
  let threeIdx: ThreeIDX

  // async function dumpCache() {
  //   // @ts-ignore
  //   const streams = await Promise.all(cache.values())
  //   const contents = streams.reduce((acc, stream) => {
  //     // @ts-ignore
  //     acc[stream.id.toString()] = stream.content
  //     return acc
  //   }, {})
  //   console.log('cache', contents)
  // }

  class Cache extends Map {
    // get(key: any) {
    //   const value = super.get(key)
    //   try {
    //     throw new Error('cache get')
    //   } catch (e) {
    //     console.log('cache get', key, value, e.stack)
    //   }
    //   return value
    // }
    // set(key: any, value) {
    //   console.log('cache set', key, value)
    //   return super.set(key, value)
    // }
  }

  beforeEach(() => {
    cache = new Cache()
    keyring = new Keyring(randomBytes(32))
    threeIdx = new ThreeIDX(ceramic, new TileLoader({ ceramic, cache }))
  })

  it('creates 3id doc', async () => {
    keyring = new Keyring(seed)
    await setup3id(threeIdx, keyring)
    const state = threeIdx.threeIDDoc.state as any
    // will be different each run
    delete state.log
    delete state.metadata.unique
    expect(state).toMatchSnapshot()
  })

  it('handles v0 3ID correctly', async () => {
    const v03ID = 'did:3:abc234'
    await setup3id(threeIdx, keyring)
    const v13ID = threeIdx.id
    threeIdx.setV03ID(v03ID)
    expect(threeIdx.id).not.toEqual(v13ID)
    expect(threeIdx.id).toEqual(v03ID)
  })

  it('creates authMapEntry', async () => {
    await setup3id(threeIdx, keyring)
    const newAuthEntry = await genAuthEntryCreate()
    const update = await threeIdx.createAuthLinkUpdate(newAuthEntry)
    expect(update.did).toEqual(newAuthEntry.did.id)

    const doc = await threeIdx.authLinks[update.did]
    expect(doc.controllers).toEqual([newAuthEntry.did.id])
    expect(doc.content).toEqual({})

    await threeIdx.applyAuthLinkUpdate(update)
    expect(doc.content).toEqual({ did: threeIdx.id })
  })

  it('createIDX with new auth entry', async () => {
    await setup3id(threeIdx, keyring)
    const newAuthEntry = await genAuthEntryCreate()
    await threeIdx.createIDX(newAuthEntry)

    await expect(threeIdx.dataStore.get('threeIdKeychain')).resolves.toEqual({
      authMap: newAuthEntry.mapEntry,
      pastSeeds: [],
    })
    // expect(threeIdx.docs.idx.content).toEqual({
    //   [KEYCHAIN_DEF]: threeIdx.docs[KEYCHAIN_DEF].id.toUrl(),
    // })
    // expect(threeIdx.docs.idx.metadata.schema).toBe(schemas.IdentityIndex)
    // expect(threeIdx.docs[KEYCHAIN_DEF].metadata.schema).toBe(schemas.ThreeIdKeychain)
    // should be pinned
    expect(await all(await ceramic.pin.ls())).toEqual(
      expect.arrayContaining(
        [
          threeIdx.threeIDDoc.id.toString(),
          // threeIdx.docs.idx.id.toString(),
          // threeIdx.docs[KEYCHAIN_DEF].id.toString(),
          (await threeIdx.authLinks[newAuthEntry.did.id]).id.toString(),
        ].map((docid) => docid.replace('ceramic://', '/ceramic/'))
      )
    )
  })

  it('createIDX with no auth entry', async () => {
    await setup3id(threeIdx, keyring)
    await threeIdx.createIDX()

    await expect(threeIdx.dataStore.has('threeIdKeychain')).resolves.toBe(false)

    // expect(threeIdx.docs.idx.content).toEqual({
    //   [KEYCHAIN_DEF]: threeIdx.docs[KEYCHAIN_DEF].id.toUrl(),
    // })
    // expect(threeIdx.docs.idx.metadata.schema).toBe(schemas.IdentityIndex)
    // expect(threeIdx.docs[KEYCHAIN_DEF].metadata.schema).toBeUndefined()
    // should be pinned
    // expect(await all(await ceramic.pin.ls())).toEqual(
    //   expect.arrayContaining(
    //     [threeIdx.threeIDDoc.id.toString(), threeIdx.docs.idx.id.toString()].map((docid) =>
    //       docid.replace('ceramic://', '/ceramic/')
    //     )
    //   )
    // )
  })

  it('loadIDX fails if authLink does not exist', async () => {
    await setup3id(threeIdx, keyring)
    const newAuthEntry = await genAuthEntryCreate()

    await expect(threeIdx.loadIDX(newAuthEntry.did.id)).resolves.toBeNull()
  })

  it('loadIDX works if IDX created', async () => {
    await setup3id(threeIdx, keyring)
    const newAuthEntry = await genAuthEntryCreate()
    await threeIdx.createIDX(newAuthEntry)

    await expect(threeIdx.loadIDX(newAuthEntry.did.id)).resolves.toEqual({
      seed: newAuthEntry.mapEntry[newAuthEntry.did.id].data,
      pastSeeds: [],
    })
  })

  it('addAuthEntries', async () => {
    await setup3id(threeIdx, keyring)
    const [nae1, nae2, nae3] = await Promise.all([
      genAuthEntryCreate(),
      genAuthEntryCreate(),
      genAuthEntryCreate(),
    ])
    await threeIdx.createIDX(nae1)
    await expect(threeIdx.getAuthMap()).resolves.toEqual(nae1.mapEntry)
    await threeIdx.addAuthEntries([nae2, nae3])

    await expect(threeIdx.getAuthMap()).resolves.toEqual({
      ...nae1.mapEntry,
      ...nae2.mapEntry,
      ...nae3.mapEntry,
    })

    const expectedPins = await Promise.all([
      (await threeIdx.authLinks[nae1.did.id]).id.toString(),
      (await threeIdx.authLinks[nae2.did.id]).id.toString(),
      (await threeIdx.authLinks[nae3.did.id]).id.toString(),
    ])
    expect(await all(await ceramic.pin.ls())).toEqual(expect.arrayContaining(expectedPins))
  })

  it('rotateKeys and gets correct 3id version', async () => {
    await setup3id(threeIdx, keyring)
    const [nae1, nae2, nae3] = await Promise.all([
      genAuthEntryCreate(),
      genAuthEntryCreate(),
      genAuthEntryCreate(),
    ])
    await threeIdx.createIDX(nae1)
    await threeIdx.addAuthEntries([nae2, nae3])

    expect(threeIdx.get3idVersion()).toEqual('0')

    await anchorService.anchor()
    await pauseSeconds(2)
    await threeIdx.threeIDDoc.sync()

    // Rotate keys correctly
    await keyring.generateNewKeys(threeIdx.get3idVersion())
    const new3idState = keyring.get3idState()
    const updatedAuthMap = {
      [nae1.did.id]: { data: fakeJWE(), id: fakeJWE() },
      [nae2.did.id]: { data: fakeJWE(), id: fakeJWE() },
    }
    await threeIdx.rotateKeys(new3idState, keyring.pastSeeds, updatedAuthMap)
    await anchorService.anchor()
    await pauseSeconds(2)

    await expect(threeIdx.getAuthMap()).resolves.toEqual(updatedAuthMap)
    await threeIdx.threeIDDoc.sync()
    const state = threeIdx.threeIDDoc.state
    expect(state.content).toEqual(expect.objectContaining(new3idState.content))
    expect(state.metadata.controllers).toEqual(new3idState.metadata.controllers)

    // load 3id with rotated keys
    expect(await threeIdx.loadIDX(nae1.did.id)).toEqual({
      seed: updatedAuthMap[nae1.did.id].data,
      pastSeeds: keyring.pastSeeds,
    })

    const latestCommit = threeIdx.threeIDDoc.commitId.commit
    expect(threeIdx.get3idVersion()).toEqual(latestCommit.toString())
  })
})
