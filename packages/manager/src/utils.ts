import fetch from 'cross-fetch'
import { fromString, toString } from 'uint8arrays'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { model as cryptoAccountsModel } from '@datamodels/identity-accounts-crypto'
import { model as webAccountsModel } from '@datamodels/identity-accounts-web'
import { model as profileModel } from '@datamodels/identity-profile-basic'
import { model as keychainModel } from '@datamodels/3id-keychain'
import { ModelManager } from '@glazed/devtools'

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

export const idxModelManager = (ceramic: CeramicClient): ModelManager => {
  const manager = new ModelManager(ceramic)
  manager.addJSONModel(cryptoAccountsModel)
  manager.addJSONModel(webAccountsModel)
  manager.addJSONModel(profileModel)
  manager.addJSONModel(keychainModel)
  return manager
}
