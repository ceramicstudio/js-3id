import { Box, Text } from 'grommet'

import { notifyDone } from '../data/connect'
import { useEthereum } from '../hooks'

import Button from './Button'

export default function LinkExistingDID() {
  const [ethereum, connect] = useEthereum()

  const button = ethereum ? (
    <Button
      id="add-id"
      label="Add ID"
      onClick={() => {
        console.log('add ID')
        ethereum.manager.createAccount().then(
          (res) => {
            console.log('created ID to link', res)
            notifyDone()
          },
          (err) => {
            console.warn('ID to link creation error', err)
          },
        )
      }}
    />
  ) : (
    <Button
      id="connect"
      label="Connect"
      onClick={() => {
        connect()
      }}
    />
  )

  return (
    <Box
      border={{ color: 'neutral-5' }}
      direction="row"
      margin={{ top: 'small' }}
      pad="medium"
      round="small">
      <Box flex justify="center">
        <Text weight="bold">Add an existing ID</Text>
      </Box>
      <Box>{button}</Box>
    </Box>
  )
}
