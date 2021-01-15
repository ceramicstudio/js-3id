/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import { AccountID } from 'caip'
import { fetchJson } from './utils'

const LEGACY_ADDRESS_SERVER = 'https://beta.3box.io/address-server'
const THREEBOX_PROFILE_API = 'https://ipfs.3box.io'

interface LinkResponse {
  did: string
}

const errorNotFound = (err: any): boolean => {
  if (err.statusCode) {
    return err?.statusCode === 404
  }
}

export const legacyDIDLinkExist = async (accountId: string): Promise<string | null> => {
  const address = new AccountID(accountId).address.toLowerCase()
  try {
    const res = await fetchJson(`${LEGACY_ADDRESS_SERVER}/odbAddress/${address}`)
    const { did } = res?.data as LinkResponse
    return did
  } catch (err) {
    if (errorNotFound(err)) return null
    throw new Error(`Error while resolve V03ID`)
  }
}

export const get3BoxProfile = async (did: string): Promise<any> => {
  try {
    const url = `${THREEBOX_PROFILE_API}?did=${encodeURIComponent(did)}`
    return fetchJson(url)
  } catch (err) {
    if (errorNotFound(err)) return null
    throw new Error(`Error while fetching 3Box Profile`)
  }
}
