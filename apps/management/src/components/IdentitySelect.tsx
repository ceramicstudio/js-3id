import type { Manage3IDs } from '3id-connect'
import { Box, Heading, Text } from 'grommet'

import IdentitiesList from './IdentitiesList'
import LinkExistingDID from './LinkExistingDID'
import LinkNewDID from './LinkNewDID'

import type { DIDsData } from '../types'

export type Props = {
  dids: DIDsData
  manager: Manage3IDs
}

export default function IdentitySelect({ dids, manager }: Props) {
  return (
    <>
      <Heading textAlign="center">Choose an identity</Heading>
      <IdentitiesList dids={dids} manager={manager} />
      <Box margin={{ top: 'medium' }}>
        <Text color="neutral-4">Don’t see an identity on this list?</Text>
      </Box>
      <LinkExistingDID />
      <LinkNewDID manager={manager} />
    </>
  )
}
