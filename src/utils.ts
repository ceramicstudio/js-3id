// Partically redundant with 3boxjs utils, but added to remove circular dependency entirely for now

import { fromString, toString } from 'uint8arrays'

export function fromHex(hex: string): Uint8Array {
  return fromString(hex, 'base16')
}

export function toHex(bytes: Uint8Array): string {
  return toString(bytes, 'base16')
}

const HTTPError = (status: number, message: string): Error => {
  const e = new Error(message)
  // @ts-ignore
  e.statusCode = status
  return e
}

export const fetchJson = async <T = unknown>(
  url: string,
  body?: Record<string, unknown>
): Promise<T> => {
  let opts
  if (body) {
    opts = {
      body: JSON.stringify(body),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  }
  const r = await window.fetch(url, opts)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const res = await r.json()

  if (r.ok) {
    return res as T
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    throw HTTPError(r.status, res.message)
  }
}
