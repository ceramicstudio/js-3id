import { Box, Text } from 'grommet'
import { useAtom } from 'jotai'

import Button from '../../components/Button'

import { notifyDone } from '../connect'
import { useEthereum } from '../hooks'
import { didsDataAtom } from '../state'

export default function LinkExistingDID() {
  const [ethereum, connect] = useEthereum()
  const [, setDidData] = useAtom(didsDataAtom)

  const button = ethereum ? (
    <Button
      label="Add ID"
      onClick={() => {
        console.log('add ID')
        ethereum.manager
          .createAccount()
          .then((res) => {
            console.log('created ID to link', res)
            notifyDone()
            didsDataAtom.onMount?.(setDidData)
          })
          .catch((err) => {
            console.warn('ID to link creation error', err)
          })
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
