import { jest } from '@jest/globals'
import { createJWE, x25519Encrypter } from 'did-jwt'
import { prepareCleartext } from 'dag-jose-utils'
import * as u8a from 'uint8arrays'

import { DidProvider, ProviderConfig } from '../src/did-provider'
import { Keyring } from '../src/keyring'

describe('DidProvider', () => {
  let nextId = 0

  function expectRPC(provider: any, origin: string | null | undefined, req: any, res: any) {
    const id = nextId++
    return expect(provider.send({ jsonrpc: '2.0', id, ...req }, origin)).resolves.toEqual({
      jsonrpc: '2.0',
      id,
      ...res,
    })
  }

  test('has a `isDidProvider` prop', () => {
    // @ts-ignore
    const provider = new DidProvider({})
    expect(provider.isDidProvider).toBe(true)
  })

  test('`did_authenticate` method returns the accounts', async () => {
    global.Date.now = jest.fn(() => 1606236374000)
    const config = {
      permissions: {
        request: jest.fn((_origin: string, paths: Array<string>) => Promise.resolve(paths)),
      },
      threeIdx: {
        id: 'did:3:test',
        get3idVersion: jest.fn(() => '0'),
      },
      keyring: {
        getSigner: () => () => Promise.resolve('signed'),
        getMgmtSigner: () => () => Promise.resolve('signed'),
        getKeyFragment: jest.fn(() => 'ab832'),
      },
    }
    const nonce = 'asdf'
    const aud = 'foo'
    await expectRPC(
      new DidProvider(config as unknown as ProviderConfig),
      'foo',
      { method: 'did_authenticate', params: { paths: [] } },
      {
        result: {
          payload: 'eyJkaWQiOiJkaWQ6Mzp0ZXN0IiwiZXhwIjoxNjA2MjM2OTc0LCJwYXRocyI6W119',
          signatures: [
            {
              protected: 'eyJraWQiOiJkaWQ6Mzp0ZXN0P3ZlcnNpb24taWQ9MCNhYjgzMiIsImFsZyI6IkVTMjU2SyJ9',
              signature: 'signed',
            },
          ],
        },
      }
    )
    expect(config.permissions.request).toBeCalledWith('foo', [])
    await expectRPC(
      new DidProvider(config as unknown as ProviderConfig),
      'foo',
      { method: 'did_authenticate', params: { paths: ['/1'], nonce, aud } },
      {
        result: {
          payload:
            'eyJhdWQiOiJmb28iLCJkaWQiOiJkaWQ6Mzp0ZXN0IiwiZXhwIjoxNjA2MjM2OTc0LCJub25jZSI6ImFzZGYiLCJwYXRocyI6WyIvMSJdfQ',
          signatures: [
            {
              protected: 'eyJraWQiOiJkaWQ6Mzp0ZXN0P3ZlcnNpb24taWQ9MCNhYjgzMiIsImFsZyI6IkVTMjU2SyJ9',
              signature: 'signed',
            },
          ],
        },
      }
    )
  })

  test('`did_createJWS` method throws an error if the user is not authenticated', async () => {
    const payload = { foo: 'bar' }
    const protectedHeader = { bar: 'baz' }
    const permissions = { has: jest.fn(() => false) }
    await expectRPC(
      new DidProvider({ permissions } as unknown as ProviderConfig),
      'bar',
      { method: 'did_createJWS', params: { payload, protected: protectedHeader } },
      { error: { code: 4100, message: 'Unauthorized' } }
    )
    expect(permissions.has).toBeCalledWith('bar')
  })

  test('`did_createJWS` returns the general JWS', async () => {
    const config = {
      permissions: { has: jest.fn(() => true) },
      threeIdx: {
        id: 'did:3:asdf',
        get3idVersion: jest.fn(() => '0'),
      },
      keyring: {
        getSigner: () => () => Promise.resolve('signed'),
        getMgmtSigner: () => () => Promise.resolve('signed'),
        getKeyFragment: jest.fn(() => 'ab832'),
      },
    }
    const payload = { foo: 'bar' }
    const protectedHeader = { bar: 'baz' }
    let did = 'did:3:asdf'
    await expectRPC(
      new DidProvider(config as unknown as ProviderConfig),
      null,
      { method: 'did_createJWS', params: { payload, protected: protectedHeader, did } },
      {
        result: {
          jws: {
            payload: 'eyJmb28iOiJiYXIifQ',
            signatures: [
              {
                protected:
                  'eyJiYXIiOiJiYXoiLCJraWQiOiJkaWQ6Mzphc2RmP3ZlcnNpb24taWQ9MCNhYjgzMiIsImFsZyI6IkVTMjU2SyJ9',
                signature: 'signed',
              },
            ],
          },
        },
      }
    )
    await expectRPC(
      new DidProvider(config as unknown as ProviderConfig),
      null,
      {
        method: 'did_createJWS',
        params: { payload, protected: protectedHeader, did, revocable: true },
      },
      {
        result: {
          jws: {
            payload: 'eyJmb28iOiJiYXIifQ',
            signatures: [
              {
                protected:
                  'eyJiYXIiOiJiYXoiLCJraWQiOiJkaWQ6Mzphc2RmI2FiODMyIiwiYWxnIjoiRVMyNTZLIn0',
                signature: 'signed',
              },
            ],
          },
        },
      }
    )
    did = 'did:key:fewfq'
    await expectRPC(
      new DidProvider(config as unknown as ProviderConfig),
      null,
      { method: 'did_createJWS', params: { payload, protected: protectedHeader, did } },
      {
        result: {
          jws: {
            payload: 'eyJmb28iOiJiYXIifQ',
            signatures: [
              {
                protected:
                  'eyJiYXIiOiJiYXoiLCJraWQiOiJkaWQ6a2V5OmZld2ZxI2Zld2ZxIiwiYWxnIjoiRVMyNTZLIn0',
                signature: 'signed',
              },
            ],
          },
        },
      }
    )
  })

  test('`did_decryptJWE` correctly decrypts a JWE', async () => {
    const keyring = new Keyring(
      u8a.fromString('f0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b', 'base16')
    )
    const encrypter = x25519Encrypter(keyring.getEncryptionPublicKey())
    const cleartext = await prepareCleartext({ asdf: 234 })
    const jwe = await createJWE(cleartext, [encrypter])
    const config = {
      permissions: { has: jest.fn(() => true) },
      keyring,
    }
    await expectRPC(
      new DidProvider(config as unknown as ProviderConfig),
      null,
      { method: 'did_decryptJWE', params: { jwe } },
      { result: { cleartext: u8a.toString(cleartext, 'base64pad') } }
    )
  })

  test('`did_decryptJWE` correctly respects permissions', async () => {
    const keyring = new Keyring(
      u8a.fromString('f0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b', 'base16')
    )
    const encrypter = x25519Encrypter(keyring.getEncryptionPublicKey())
    const [cleartext1, cleartext2] = await Promise.all([
      prepareCleartext({ paths: ['a'] }),
      prepareCleartext({ paths: ['b'] }),
    ])
    const [jwe1, jwe2] = await Promise.all([
      createJWE(cleartext1, [encrypter]),
      createJWE(cleartext2, [encrypter]),
    ])
    const config = {
      permissions: {
        has: jest.fn((_, paths: Array<string>) => {
          return paths ? paths.includes('a') : true
        }),
      },
      keyring,
    }
    await expectRPC(
      new DidProvider(config as unknown as ProviderConfig),
      null,
      { method: 'did_decryptJWE', params: { jwe: jwe1 } },
      { result: { cleartext: u8a.toString(cleartext1, 'base64pad') } }
    )
    await expectRPC(
      new DidProvider(config as unknown as ProviderConfig),
      null,
      { method: 'did_decryptJWE', params: { jwe: jwe2 } },
      { error: { code: 4100, data: undefined, message: 'Unauthorized' } }
    )
  })
})
