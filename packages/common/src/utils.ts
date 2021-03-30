import { fromString, toString } from 'uint8arrays'

export function fromHex(hex: string): Uint8Array {
  return fromString(hex, 'base16')
}

export function toHex(bytes: Uint8Array): string {
  return toString(bytes, 'base16')
}
