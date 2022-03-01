import fetch from 'cross-fetch'
import { fromString, toString } from 'uint8arrays'

const HTTPError = (status: number, message: string): Error => {
  const e = new Error(message)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    throw HTTPError(r.status, res.message)
  }
}

export const jwtDecode = <T>(jwt: string): T => {
  const payload = jwt.split('.')[1]
  const uint8 = fromString(payload, 'base64')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return JSON.parse(toString(uint8))
}

export const waitMS = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
