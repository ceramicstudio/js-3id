import * as hexToRgb from 'hex-to-rgb'
import Ceramic from '@ceramicnetwork/http-client'
import type { CeramicApi } from '@ceramicnetwork/common'
import { IDX } from '@ceramicstudio/idx'

export const hexToRGBA = (hex: string, opacity?: number | null): string =>
  `rgba(${hexToRgb(hex) as string}, ${(opacity || 30) / 100})`

export async function createCeramic(): Promise<CeramicApi> {
  // TODO: move to ENV var
  const ceramic = new Ceramic('https://ceramic-clay.3boxlabs.com')
  return Promise.resolve(ceramic as CeramicApi)
}

export const createIdx = (ceramic: CeramicApi) => {
  const idx = new IDX({ ceramic })
  return idx
}
