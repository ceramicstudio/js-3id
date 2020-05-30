// Partically redundant with 3boxjs utils, but added to remove circular dependency entirely for now 

const HTTPError = (status, message) => {
  const e = new Error(message)
  e.statusCode = status
  return e
}

const fetchJson = async (url, body) => {
  let opts
  if (body) {
    opts = { body: JSON.stringify(body), method: 'POST', headers: { 'Content-Type': 'application/json' } }
  }
  const r = await window.fetch(url, opts)

  if (r.ok) {
    let res = await r.json()
    return res
  } else {
    throw HTTPError(r.status, (await r.json()).message)
  }
}

const isLinked = async (address) => {
  try {
    const res = await fetchJson(`https://beta.3box.io/address-server/odbAddress/${address}`)
    return Boolean(res.data.rootStoreAddress)
  } catch (err) {
    return false
  }
}

export {
  fetchJson,
  isLinked
}
