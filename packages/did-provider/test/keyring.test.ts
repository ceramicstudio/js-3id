import * as u8a from 'uint8arrays'
import { randomBytes } from '@stablelib/random'

import { Keyring } from '../src/keyring'

describe('Keyring', () => {
  const seed = u8a.fromString(
    'f0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b',
    'base16'
  )

  it('Generates random seed if none passed', () => {
    const keyring = new Keyring()
    expect(keyring.seed).toBeDefined()
  })

  it('Derives correct keys from seed', () => {
    const keyring = new Keyring(seed)
    expect(keyring.seed).toEqual(seed)
    expect(keyring.pastSeeds).toEqual([])
    expect(keyring.get3idState(true)).toMatchSnapshot()
    expect(keyring.get3idState()).toMatchSnapshot()
    expect(keyring.getEncryptionPublicKey()).toMatchSnapshot()
    expect(keyring.seed).toMatchSnapshot()
    expect(keyring.v03ID).not.toBeDefined()
  })

  it('Generates correct state if v03ID is set', () => {
    const v03ID = 'did:3:abc3234'
    const keyring = new Keyring(seed, v03ID)
    expect(keyring.get3idState(true)).toMatchSnapshot()
    expect(keyring.get3idState()).toMatchSnapshot()
    expect(keyring.v03ID).toEqual(v03ID)
  })

  it('generate and load keys', async () => {
    const seed = randomBytes(32)
    const keyring = new Keyring(seed)
    expect(keyring.seed).toEqual(seed)
    const signed0 = await keyring.getSigner()('asdf')
    const mgmt0 = keyring.get3idState().metadata.controllers[0].split(':')[2]

    const v0 = 'versionCID0'
    await keyring.generateNewKeys(v0)
    expect(keyring.seed).not.toEqual(seed)
    expect(await keyring.getSigner(v0)('asdf')).toEqual(signed0)
    const signed1 = await keyring.getSigner()('asdf')
    expect(signed1).not.toEqual(signed0)
    const mgmt1 = keyring.get3idState().metadata.controllers[0].split(':')[2]

    const v1 = 'versionCID1'
    await keyring.generateNewKeys(v1)
    expect(keyring.seed).not.toEqual(seed)
    expect(await keyring.getSigner(v0)('asdf')).toEqual(signed0)
    expect(await keyring.getSigner(v1)('asdf')).toEqual(signed1)
    const signed2 = await keyring.getSigner()('asdf')
    expect(signed2).not.toEqual(signed0)
    expect(signed2).not.toEqual(signed1)
    const docState2 = keyring.get3idState()
    const mgmt2 = keyring.get3idState().metadata.controllers[0].split(':')[2]

    const mgmtSigs = await Promise.all([
      keyring.getMgmtSigner(mgmt0)('asdf'),
      keyring.getMgmtSigner(mgmt1)('asdf'),
      keyring.getMgmtSigner(mgmt2)('asdf'),
    ])

    const pastSeeds = keyring.pastSeeds
    const keyring1 = new Keyring(keyring.seed)
    expect(await keyring1.getSigner()('asdf')).toEqual(signed2)
    await keyring1.loadPastSeeds(pastSeeds)
    expect(await keyring1.getSigner(v0)('asdf')).toEqual(signed0)
    expect(await keyring1.getSigner(v1)('asdf')).toEqual(signed1)
    expect(keyring1.get3idState()).toEqual(docState2)

    expect(
      await Promise.all([
        keyring1.getMgmtSigner(mgmt0)('asdf'),
        keyring1.getMgmtSigner(mgmt1)('asdf'),
        keyring1.getMgmtSigner(mgmt2)('asdf'),
      ])
    ).toEqual(mgmtSigs)
  })

  it('loads legacy keys correctly', async () => {
    const v03ID = 'did:3:abc3234'
    const seed = randomBytes(32)
    const keyring0 = new Keyring(seed, v03ID)
    const v0 = 'versionCID0'
    await keyring0.generateNewKeys(v0)

    const pastSeeds = keyring0.pastSeeds
    // create new keyring with latest seed
    const keyring1 = new Keyring(keyring0.seed)
    expect(keyring1.v03ID).not.toBeDefined()
    await keyring1.loadPastSeeds(pastSeeds)
    expect(keyring1.v03ID).toEqual(v03ID)
    expect((keyring1 as any)._keySets).toEqual((keyring0 as any)._keySets)
  })

  it('generateNewKeys throws if version already exist', async () => {
    const keyring = new Keyring()
    const v = 'versionCID0'
    await keyring.generateNewKeys(v)
    await expect(keyring.generateNewKeys(v)).rejects.toThrow('Key set version already exist')
  })
})
