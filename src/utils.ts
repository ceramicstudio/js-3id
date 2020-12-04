// Partically redundant with 3boxjs utils, but added to remove circular dependency entirely for now

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

export const isLinked = async (address: string): Promise<boolean> => {
  try {
    const res = await fetchJson<{ data: { rootStoreAddress: string } }>(
      `https://beta.3box.io/address-server/odbAddress/${address}`
    )
    return Boolean(res.data.rootStoreAddress)
  } catch (err) {
    return false
  }
}
