import type { Manager } from '@3id/did-manager'
import { DIDDataStore } from '@glazed/did-datastore'
import type { BasicProfile, ImageMetadata, ImageSources }  from '@datamodels/identity-profile-basic'
import { AccountId } from 'caip'
import { IPFS_PREFIX, IPFS_URL } from '../constants'
import type { DIDsData } from '../types'
import { normalizeAccountId } from '@ceramicnetwork/common'

export type Dimensions = { height: number; width: number }
export type SizeMode = 'contain' | 'cover'

export async function loadProfile(did: string, dataStore: DIDDataStore): Promise<BasicProfile | null> {
  try {
    return await dataStore.get('basicProfile', did)
  } catch (err) {
    return null
  }
}

export function formatDID(did: string): string {
  return did.length <= 20 ? did : `${did.slice(0, 10)}…${did.slice(-5)}`
}

export function longFormatDID(did: string): string {
  return `${did.slice(0, 10)}…${did.slice(-9)}`
}

function selectCover(
  options: Array<ImageMetadata>,
  { height, width }: Dimensions
): ImageMetadata | null {
  let selected: ImageMetadata | null = null
  for (const option of options) {
    if (
      option.height >= height &&
      option.width >= width &&
      (selected === null ||
        (selected.size != null && option.size != null && option.size < selected.size) ||
        option.height * option.width < selected.height * selected.width)
    ) {
      selected = option
    }
  }
  return selected
}

function selectContain(
  options: Array<ImageMetadata>,
  { height, width }: Dimensions
): ImageMetadata | null {
  let selected: ImageMetadata | null = null
  for (const option of options) {
    if (
      option.height <= height &&
      option.width <= width &&
      (selected === null ||
        (selected.size != null && option.size != null && option.size < selected.size) ||
        option.height * option.width > selected.height * selected.width)
    ) {
      selected = option
    }
  }
  return selected
}

export function selectImageSource(
  sources: ImageSources,
  dimensions: Dimensions,
  mode: SizeMode = 'cover'
): ImageMetadata {
  let alternative: ImageMetadata | null = null
  if (Array.isArray(sources.alternatives)) {
    alternative =
      mode === 'cover'
        ? selectCover(sources.alternatives, dimensions)
        : selectContain(sources.alternatives, dimensions)
  }
  return alternative ?? sources.original
}

export function toImageSrc(image: ImageMetadata): string {
  return image.src.replace(IPFS_PREFIX, IPFS_URL)
}

export function getImageSrc(sources: ImageSources, dimensions: Dimensions, mode?: SizeMode) {
  return toImageSrc(selectImageSource(sources, dimensions, mode))
}

export async function getDIDsData(manager: Manager): Promise<DIDsData> {
  const dataStore = manager.dataStore
  const dids = (await manager.listDIDS()) ?? []
  const entries = await Promise.all(
    dids.map(async (did:string) => {
      const accountsObj = await dataStore.get('cryptoAccounts', did)
      const accounts = accountsObj ? Object.keys(accountsObj) : []
      return {
        did,
        accounts: accounts.map((account) => normalizeAccountId(account)),
        profile: await loadProfile(did, dataStore),
      }
    })
  )
  return entries.reduce((acc, { did, ...entry }) => {
    acc[did] = entry
    return acc
  }, {} as DIDsData)
}
