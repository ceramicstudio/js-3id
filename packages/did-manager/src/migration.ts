/* eslint-disable  @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return,  @typescript-eslint/no-unsafe-call */
import { fromHex } from '@3id/common'
import type { Account as AlsoKnownAsAccount, BasicProfile } from '@3id/model'
import { getResolver } from '@ceramicnetwork/3id-did-resolver'
import type { AuthProvider, LinkProof } from '@ceramicnetwork/blockchain-utils-linking'
import type { CeramicApi } from '@ceramicnetwork/common'
import { mnemonicToSeed, entropyToMnemonic } from '@ethersproject/hdnode'
import { DIDDataStore } from '@glazed/did-datastore'
import { AccountId } from 'caip'
import { DagJWS, DID, DIDProvider } from 'dids'

import type { ExcludesBoolean, LinksArray } from './types.js'
import { fetchJson, jwtDecode } from './utils.js'

const LEGACY_ADDRESS_SERVER = 'https://beta.3box.io/address-server'
const THREEBOX_PROFILE_API = 'https://ipfs.3box.io'
let VERIFICATION_SERVICE = 'https://verifications-clay.3boxlabs.com'
typeof process !== 'undefined' &&
  (VERIFICATION_SERVICE =
    process.env.VERIFICATION_SERVICE || 'https://verifications-clay.3boxlabs.com')

export class Migrate3IDV0 {
  private dataStore: DIDDataStore
  private ceramic: CeramicApi
  private user: DID

  constructor(threeIdProvider: DIDProvider, dataStore: DIDDataStore) {
    this.dataStore = dataStore
    this.ceramic = dataStore.ceramic
    this.user = new DID({
      provider: threeIdProvider,
      resolver: getResolver(this.ceramic),
    })
  }

  /**
   *  Creates a legacy 3Box root seed
   */
  static async legacySeedCreate(authProvider: AuthProvider): Promise<Uint8Array> {
    const message = 'This app wants to view and update your 3Box profile.'
    const authSecret = await authProvider.authenticate(message)
    const seed = mnemonicToSeed(entropyToMnemonic(authSecret))
    return fromHex(seed.slice(2))
  }

  async userDIDAuthenticated() {
    if (!this.user.authenticated) await this.user.authenticate()
  }

  async migrateAKALinks(did: string, profile = {} as any): Promise<void> {
    await this.userDIDAuthenticated()

    const existing = async (dataStore: DIDDataStore): Promise<Array<AlsoKnownAsAccount>> => {
      return (await dataStore.get('alsoKnownAs'))?.accounts || []
    }

    const results: Array<Array<AlsoKnownAsAccount> | AlsoKnownAsAccount | null> = await Promise.all(
      [
        existing(this.dataStore),
        this._twitterVerify(did, profile),
        this._githubVerify(did, profile),
      ]
    )

    const accounts: Array<AlsoKnownAsAccount> = results
      .filter(Boolean as any as ExcludesBoolean)
      .flat()

    await this.dataStore.set('alsoKnownAs', { accounts })
  }

  // Returns 3box original profile
  async migrate3BoxProfile(did: string): Promise<any> {
    const profile = await get3BoxProfile(did)
    const transform = transformProfile(profile)
    await this.dataStore.merge('basicProfile', transform)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return profile
  }

  async _twitterVerify(did: string, profile: any): Promise<AlsoKnownAsAccount | null> {
    await this.userDIDAuthenticated()
    try {
      if (!profile.proof_twitter) return null
      const type = 'twitter'
      const decoded = jwtDecode<{ claim: { twitter_handle: string; twitter_proof: string } }>(
        profile.proof_twitter
      )
      const twitterHandle = decoded.claim?.twitter_handle
      const tweetUrl = decoded.claim?.twitter_proof
      const challengeCode = await linkRequest(type, did, twitterHandle)
      const jws = await this.user.createJWS({ challengeCode })
      const twitterProof = await linkVerify(type, jws, tweetUrl)
      return {
        protocol: 'https',
        host: 'twitter.com',
        id: twitterHandle,
        claim: tweetUrl,
        attestations: [{ 'did-jwt-vc': twitterProof }],
      }
    } catch (e) {
      return null
    }
  }

  async _githubVerify(did: string, profile: any): Promise<AlsoKnownAsAccount | null> {
    await this.userDIDAuthenticated()
    try {
      if (!profile.proof_github) return null
      const type = 'github'
      const gistUrl = profile.proof_github
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const githubHandle = profile.proof_github?.split('//')[1]?.split('/')[1]
      if (!githubHandle) throw new Error('link fail')
      const challengeCode = await linkRequest(type, did, githubHandle)
      const jws = await this.user.createJWS({ challengeCode })
      const githubProof = await linkVerify(type, jws, gistUrl)
      return {
        protocol: 'https',
        host: 'github.com',
        id: githubHandle,
        claim: gistUrl,
        attestations: [{ 'did-jwt-vc': githubProof }],
      }
    } catch (e) {
      return null
    }
  }
}

const errorNotFound = (err: any): boolean => {
  if (err.statusCode) {
    return err?.statusCode === 404
  }
  return false
}

export const legacyDIDLinkExist = async (accountId: string): Promise<string | null> => {
  const account = new AccountId(accountId)
  if (account.chainId.namespace !== 'eip155') {
    // Only attempt migration for Ethereum accounts
    return null
  }
  const address = account.address.toLowerCase()
  try {
    const res = await fetchJson<{ data: { did: string } }>(
      `${LEGACY_ADDRESS_SERVER}/odbAddress/${address}`
    )
    const { did } = res.data
    return did
  } catch (err) {
    if (errorNotFound(err)) {
      console.log(
        'Note: 404 Error is expected behavior, and indicates the user does not have a legacy 3Box profile.'
      )
      return null
    }
    console.error(`Error while resolving V03ID`)
    return null
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

// TODO links pass opt, to reduce network requests
export const get3BoxLinkProof = async (did: string): Promise<LinkProof | null> => {
  try {
    const { links } = await get3BoxConfig(did)
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

export const get3BoxConfig = async (did: string): Promise<LinksArray> => {
  const url = `${THREEBOX_PROFILE_API}/config?did=${encodeURIComponent(did)}`
  return fetchJson<LinksArray>(url)
}

// returns ipfs json object, not a valid did doc
export const getLegacyDidDoc = async (did: string): Promise<any> => {
  const cid = did.split(':').pop() as string
  const url = `${THREEBOX_PROFILE_API}/did-doc?cid=${encodeURIComponent(cid)}`
  const { value } = await fetchJson<{ value: any }>(url)
  return value
}

// return true if migration is expected to fail, can added additional known cases here
export const willMigrationFail = async (accountId: string, did: string): Promise<boolean> => {
  const address = new AccountId(accountId).address.toLowerCase()
  // Case 1: more than one account linked to did and address server link does not match did doc link
  // Reference: https://github.com/ceramicstudio/3id-connect/issues/67
  const doc = await getLegacyDidDoc(did)
  let managementAddress
  try {
    const managementEntry = doc.publicKey.findIndex((e: any) => e.id.endsWith('managementKey'))
    managementAddress = doc.publicKey[managementEntry].ethereumAddress
  } catch (e) {
    return true
  }
  return address !== managementAddress
}

// Validation for BasicProfile
const lengthIndex = <Record<string, number>>{
  name: 150,
  description: 420,
  location: 140, //homeLocation
  website: 240, // url
  emoji: 2,
  employer: 140, //affiliations
  school: 140, //affiliations
}

const isStrAndLen = (obj: any, key: string): boolean => {
  if (!lengthIndex[key]) return false
  return typeof obj[key] === 'string' && obj[key].length <= lengthIndex[key]
}

// Transforms give 3box.io profile to a BasicProfile
export const transformProfile = (profile: any): BasicProfile => {
  const transform = {} as BasicProfile
  let image, background
  if (isStrAndLen(profile, 'name')) transform.name = profile.name
  if (isStrAndLen(profile, 'description')) transform.description = profile.description
  if (isStrAndLen(profile, 'location')) transform.homeLocation = profile.location
  if (isStrAndLen(profile, 'website')) transform.url = profile.website
  if (isStrAndLen(profile, 'emoji')) transform.emoji = profile.emoji
  if (isStrAndLen(profile, 'employer')) transform.affiliations = [profile.employer]
  if (isStrAndLen(profile, 'school')) {
    transform.affiliations = (transform.affiliations || []).concat([profile.school])
  }
  if (profile.image) image = profile.image[0]?.contentUrl['/']
  if (image && typeof image === 'string') {
    transform.image = {
      original: {
        src: `ipfs://${image}`,
        mimeType: 'application/octet-stream',
        width: 170,
        height: 170,
      },
    }
  }
  if (profile.coverPhoto) background = profile.coverPhoto[0]?.contentUrl['/']
  if (background && typeof background === 'string') {
    transform.background = {
      original: {
        src: `ipfs://${background}`,
        mimeType: 'application/octet-stream',
        width: 1000,
        height: 175,
      },
    }
  }
  return transform
}

type LinkType = 'twitter' | 'github'

export const linkRequest = async (
  type: LinkType,
  did: string,
  username: string
): Promise<string> => {
  try {
    const body = { username, did }
    const url = `${VERIFICATION_SERVICE}/api/v0/request-${type}`
    const res = await fetchJson<{ data: { challengeCode: string } }>(url, body)
    return res.data.challengeCode
  } catch (err) {
    console.error(err)
    throw new Error(`Error while requesting ${type} link request.`)
  }
}

export const linkVerify = async (
  type: string,
  jws: DagJWS,
  verificationUrl: string
): Promise<string> => {
  try {
    const body = { jws, verificationUrl }
    const url = `${VERIFICATION_SERVICE}/api/v0/confirm-${type}`
    const res = await fetchJson<{ data: { attestation: string } }>(url, body)
    return res.data.attestation
  } catch (err) {
    console.error(err)
    throw new Error(`Error while verifying ${type} link request.`)
  }
}
