import * as hexToRgb from 'hex-to-rgb'
import type { Deferred } from '../Types'

export const hexToRGBA = (hex: string, opacity?: number | null): string =>
  `rgba(${hexToRgb(hex) as string}, ${(opacity || 30) / 100})`

export const didShorten = (did: string): string =>
  `${did.substring(0, 10)}...${did.substring(did.length - 5, did.length)}`

export const ipfsToImg = (url: string) => {
  let formattedUrl = url.split('ipfs://')[1]
  formattedUrl = `https://ipfs.infura.io/ipfs/${formattedUrl}`
  return formattedUrl
}

export function deferred<T>(): Deferred<T> {
  let methods
  const promise = new Promise<T>((resolve, reject): void => {
    methods = { resolve, reject }
  })
  return Object.assign(promise, methods) as Deferred<T>
}
