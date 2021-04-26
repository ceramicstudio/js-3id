import type { Manager } from '@3id/manager'
import { Box, Heading, Text } from 'grommet'

import IdentitiesList from './IdentitiesList'
import LinkExistingDID from './LinkExistingDID'
import LinkNewDID from './LinkNewDID'

import type { DIDsData } from '../types'

export type Props = {
  dids: DIDsData
  manager: Manager
}

export default function IdentitySelect({ dids, manager }: Props) {
  const options = Object.keys(dids).length ? (
    <>
      <Heading textAlign="center">Choose an identity</Heading>
      <IdentitiesList dids={dids} manager={manager} />
      <Box margin={{ top: 'medium' }}>
        <Text color="neutral-4">Don’t see an identity on this list?</Text>
      </Box>
    </>
  ) : (
    <Heading textAlign="center">Add an identity</Heading>
  )

  return (
    <>
      {options}
      <LinkExistingDID />
      <LinkNewDID manager={manager} />
    </>
  )
}
