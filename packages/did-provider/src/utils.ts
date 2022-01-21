import stringify from 'fast-json-stable-stringify'
import * as u8a from 'uint8arrays'

import type { JWE } from 'did-jwt'

const B16 = 'base16'
const B64 = 'base64pad'

const multicodecPubkeyTable: Record<string, number> = {
  secp256k1: 0xe7,
  x25519: 0xec,
  ed25519: 0xed,
}

export function encodeKey(key: Uint8Array, keyType: string): string {
  const bytes = new Uint8Array(key.length + 2)
  if (!multicodecPubkeyTable[keyType]) {
    throw new Error(`Key type "${keyType}" not supported.`)
  }
  bytes[0] = multicodecPubkeyTable[keyType]
  // The multicodec is encoded as a varint so we need to add this.
  // See js-multicodec for a general implementation
  bytes[1] = 0x01
  bytes.set(key, 2)
  return `z${u8a.toString(bytes, 'base58btc')}`
}

export function decodeKey(key: string): Uint8Array {
  // remove 'z' and decode bytes
  const bytes = u8a.fromString(key.slice(1), 'base58btc')
  const supportedKey =
    bytes[1] === 0x01 &&
    (multicodecPubkeyTable['secp256k1'] === bytes[0] ||
      multicodecPubkeyTable['x25519'] === bytes[0] ||
      multicodecPubkeyTable['ed25519'] === bytes[0])
  if (!supportedKey) throw new Error(`Key type ${bytes[0]} not supported`)
  return bytes.slice(2)
}

export function parseJWEKids(jwe: JWE): Array<string> {
  return (
    jwe.recipients?.reduce((kids: Array<string>, recipient): Array<string> => {
      if (recipient.header?.kid) kids.push(recipient.header.kid.split('#')[1])
      return kids
    }, []) || []
  )
}

export function hexToU8A(s: string): Uint8Array {
  return u8a.fromString(s, B16)
}

export function u8aToHex(b: Uint8Array): string {
  return u8a.toString(b, B16)
}

export function encodeBase64(b: Uint8Array): string {
  return u8a.toString(b, B64)
}

export function decodeBase64(s: string): Uint8Array {
  return u8a.fromString(s, B64)
}

export function toStableObject(obj: Record<string, any>): Record<string, any> {
  return JSON.parse(stringify(obj)) as Record<string, any>
}

export function isDefined<T>(val: T | undefined | null): val is T {
  return val !== undefined && val !== null
}
