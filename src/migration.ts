/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import { AccountID } from 'caip'
import { fetchJson } from './utils'
import type { BasicProfile } from '@ceramicstudio/idx-constants'
import type { LinkProof } from '@ceramicnetwork/blockchain-utils-linking'

const LEGACY_ADDRESS_SERVER = 'https://beta.3box.io/address-server'
const THREEBOX_PROFILE_API = 'https://ipfs.3box.io'

const errorNotFound = (err: any): boolean => {
  if (err.statusCode) {
    return err?.statusCode === 404
  }
  return false
}

export const legacyDIDLinkExist = async (accountId: string): Promise<string | null> => {
  const address = new AccountID(accountId).address.toLowerCase()
  try {
    const res = await fetchJson<{ data: { did: string } }>(
      `${LEGACY_ADDRESS_SERVER}/odbAddress/${address}`
    )
    const { did } = res.data
    return did
  } catch (err) {
    if (errorNotFound(err)) return null
    throw new Error(`Error while resolve V03ID`)
  }
}

export const get3BoxProfile = async (did: string): Promise<any> => {
  try {
    const url = `${THREEBOX_PROFILE_API}/profile?did=${encodeURIComponent(did)}`
    return fetchJson(url)
  } catch (err) {
    if (errorNotFound(err)) return null
    throw new Error(`Error while fetching 3Box Profile`)
  }
}

export const get3BoxLinkProof = async (did: string): Promise<LinkProof | null> => {
  try {
    const url = `${THREEBOX_PROFILE_API}/config?did=${encodeURIComponent(did)}`
    console.log(url)
    const { links } = await fetchJson<{ links: Array<any> }>(url)
    const link = links.filter((e) => e.type === 'ethereum-eoa')[0]
    if (!link) return null
    //v1 to v2 link proof
    return {
      account: `${link.address as string}@eip155:1`,
      message: link.message,
      signature: link.signature,
      timestamp: link.timestamp,
      type: 'ethereum-eoa',
      version: 2,
    }
  } catch (err) {
    console.log(err)
    if (errorNotFound(err)) return null
    throw new Error(`Error while fetching 3Box Config`)
  }
}

// Transforms give 3box.io profile to a BasicProfile
export const transformProfile = (profile: any): BasicProfile => {
  const transform = {} as BasicProfile
  let image, background
  if (profile.name) transform.name = profile.name
  if (profile.description) transform.description = profile.description
  if (profile.location) transform.homeLocation = profile.location
  if (profile.website) transform.url = profile.website
  if (profile.emoji) transform.emoji = profile.emoji
  if (profile.image) image = profile.image[0].contentUrl['/'] as string
  if (image) {
    transform.image = {
      original: {
        src: `ipfs://${image}`,
        mimeType: 'application/octet-stream',
        width: 170,
        height: 170,
      },
    }
  }
  if (profile.coverPhoto) background = profile.coverPhoto[0].contentUrl['/'] as string
  if (background) {
    transform.background = {
      original: {
        src: `ipfs://${background}`,
        mimeType: 'application/octet-stream',
        width: 1000,
        height: 175,
      },
    }
  }

  // School, work in affiliations?

  //TODO validate, drop keys that dont
  return transform
}
