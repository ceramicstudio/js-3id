import type { ThemeType } from 'grommet'

export const BRAND_COLOR = '#FC1591'
export const ACCENT_COLOR = 'rgba(252, 21, 145, 0.1)'
export const PLACEHOLDER_COLOR = '#949494'

export const theme: ThemeType = {
  global: {
    colors: {
      brand: BRAND_COLOR,
      focus: BRAND_COLOR,
      text: '#181817',
      'accent-1': ACCENT_COLOR,
      'neutral-1': '#757575',
      'neutral-2': '#888888',
      'neutral-3': '#909090',
      'neutral-4': '#A8A8A8',
      'neutral-5': '#D8D8D8',
      'neutral-6': '#F7F7F7',
    },
    control: {
      border: {
        color: 'neutral-5',
      },
    },
  },
  anchor: {
    fontWeight: 400,
  },
  button: {
    border: {
      radius: '5px',
    },
  },
  // text: {
  //   medium: {
  //     size: '18px',
  //   },
  // },
}
