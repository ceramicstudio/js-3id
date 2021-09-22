import * as hexToRgb from 'hex-to-rgb'

export const hexToRGBA = (hex: string, opacity?: number | null): string =>
  `rgba(${hexToRgb(hex) as string}, ${(opacity || 30) / 100})`
