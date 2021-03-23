import { Button as GrommetButton } from 'grommet'
import type { ButtonType } from 'grommet'

import { BRAND_COLOR } from '../theme'

const style = { border: 0, color: BRAND_COLOR }

export default function Button(props: ButtonType) {
  return <GrommetButton style={style} {...props} />
}
