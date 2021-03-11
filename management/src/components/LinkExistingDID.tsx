import { Box, Text } from 'grommet'

import { useEthereum } from '../hooks'

import Button from './Button'

export default function LinkExistingDID() {
  const [ethereum, connect] = useEthereum()

  const button = ethereum ? (
    <Button
      label="Add ID"
      onClick={() => {
        // TODO: ethereum.manager.createAccount()
        console.log('add ID')
      }}
    />
  ) : (
    <Button
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
