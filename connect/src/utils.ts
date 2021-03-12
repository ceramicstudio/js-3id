import { fromString, toString } from 'uint8arrays'
import { RPCError } from 'rpc-utils'
import type { RPCErrorObject } from 'rpc-utils'
import fetch from 'cross-fetch'

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
  const r = await fetch(url, opts)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const res = await r.json()

  if (r.ok) {
    return res as T
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    throw HTTPError(r.status, res.message)
  }
}

export const jwtDecode = <T>(jwt: string): T => {
  const payload = jwt.split('.')[1]
  const uint8 = fromString(payload, 'base64')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return JSON.parse(toString(uint8))
}

// TODO didprovider, auth failed codes?
export const rpcError = (id: string | number): RPCErrorObject & { id: string | number } => {
  const rpcError = new RPCError(-32401, `3id-connect: Request not authorized`)
  return Object.assign(rpcError.toObject(), { id })
}
