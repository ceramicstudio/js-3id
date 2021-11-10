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
  console.log(contrast)
  return contrast
}
