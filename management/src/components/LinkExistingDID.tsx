import { Box, Text } from 'grommet'

import { notify } from '../data/connect'
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
        ethereum.manager.createAccount().then(
          (res) => {
            console.log('created ID to link', res)
            notify('3id-connect-callback')
          },
          (err) => {
            console.warn('ID to link creation error', err)
          },
        )
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
