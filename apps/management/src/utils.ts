// @ts-ignore
import * as hexToRgb from 'hex-to-rgb'
import { AccountId } from 'caip'

/** @internal */
export type Deferred<T> = Promise<T> & {
  resolve: (value?: T | PromiseLike<T>) => void
  reject: (reason?: any) => void
}
  
/** @internal */
export function deferred<T>(): Deferred<T> {
  let methods
  const promise = new Promise<T>((resolve, reject): void => {
    methods = { resolve, reject }
  })
  return Object.assign(promise, methods) as Deferred<T>
}

export const hexToRGBA = (hex: string, opacity?: number | null): string =>
  `rgba(${hexToRgb(hex) as string}, ${(opacity || 30) / 100})`

export const didShorten = (did: string): string =>
  `${did.substring(0, 10)}...${did.substring(did.length - 5, did.length)}`

export function formatCAIP10 (caip: string): string {
  const account =  new AccountId(caip)
  return `${account.address.slice(0, 8)}…${account.address.slice(-8)}`
}

export const ipfsToImg = (url: string) => {
  let formattedUrl = url.split('ipfs://')[1]
  formattedUrl = `https://ipfs.infura.io/ipfs/${formattedUrl}`
  return formattedUrl
}

export const urlToHost = (url: string) => {
  const parsed = new URL(url)
  return parsed.hostname
}

export const urlToIcon = (url: string) => {
  const host = urlToHost(url)
  return host.slice(0,1).toUpperCase()
}

/**
 * @param color MUST be a Hex Color
 * returns an int between 0 and 255.
 * 0 is black, 255 is white
 *
 * Suggested use: if above 127 then use font white, else black
 */
export const detectContrast = (color: string) => {
  const background = hexToRgb(color)

  const contrast = Math.round(
    (parseInt(background[0]) * 299 +
      parseInt(background[1]) * 587 +
      parseInt(background[2]) * 114) /
      1000
  )

  return contrast
}
  