import type { Manage3IDs } from '3id-connect'
import { Box, Text } from 'grommet'

import { notifyDone } from '../data/connect'

import Button from './Button'

export type Props = {
  manager: Manage3IDs
}

export default function LinkNewDID({ manager }: Props) {
  return (
    <Box
      border={{ color: 'neutral-5' }}
      direction="row"
      margin={{ top: 'small' }}
      pad="medium"
      round="small">
      <Box flex justify="center">
        <Text weight="bold">Create a new ID</Text>
      </Box>
      <Box>
        <Button
          label="New ID"
          onClick={() => {
            manager.createAccount().then(
              (res) => {
                console.log('created ID', res)
                notifyDone()
              },
              (err) => {
                console.warn('ID creation error', err)
              },
            )
          }}
        />
      </Box>
    </Box>
  )
}
