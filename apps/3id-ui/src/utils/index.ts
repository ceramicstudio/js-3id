import * as hexToRgb from 'hex-to-rgb'

export const hexToRGBA = (hex: string, opacity?: number | null): string =>
  `rgba(${hexToRgb(hex) as string}, ${(opacity || 30) / 100})`

export const didShorten = (did: string): string =>
  `${did.substring(0, 10)}...${did.substring(did.length - 5, did.length)}`

export const ipfsToImg = (url: string) => {
  let formattedUrl = url.split('ipfs://')[1]
  formattedUrl = `https://ipfs.infura.io/ipfs/${formattedUrl}`
  return formattedUrl
}

export const urlToHost = (url: string) => {
  const parsed = new URL(url)
  return parsed.hostname
}
