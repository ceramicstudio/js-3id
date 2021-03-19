import type { Manage3IDs } from '3id-connect'
import { Avatar, Box, Text } from 'grommet'
import { useMemo } from 'react'

import { notify } from '../data/connect'
import { formatDID, getImageSrc } from '../data/idx'
import { useEthereum } from '../hooks'
import avatarPlaceholder from '../images/avatar-placeholder.png'
import { ACCENT_COLOR } from '../theme'
import type { DIDData, DIDsData } from '../types'

import Button from './Button'

type ItemProps = {
  data: DIDData
  did: string
  manager: Manage3IDs
}

function IdentityItem({ data, did, manager }: ItemProps) {
  const { accounts, profile } = data
  const [ethereum] = useEthereum()

  const avatarSrc = useMemo(() => {
    return profile?.image
      ? getImageSrc(profile.image, { height: 65, width: 65 })
      : avatarPlaceholder
  }, [profile])

  let hasConnectedAccount = false
  const displayAccounts = accounts.map((account) => {
    const isConnectedAccount = account.address === ethereum?.account.address
    hasConnectedAccount = hasConnectedAccount || isConnectedAccount
    return (
      <Text
        key={account.address}
        color={isConnectedAccount ? 'brand' : 'neutral-3'}>
        {account.address}
      </Text>
    )
  })

  return (
    <Box
      border={{ color: 'neutral-5' }}
      margin={{ bottom: 'medium' }}
      round="small">
      <Box direction="row" gap="small" pad="medium">
        <Avatar size="65px" src={avatarSrc} />
        <Box flex>
          <Text weight="bold">{profile?.name ?? '(no name)'}</Text>
          <Text color="neutral-4">{formatDID(did)}</Text>
        </Box>
        <Box>
          <Button
            primary
            color={ACCENT_COLOR}
            label="Link"
            onClick={() => {
              // TODO: call manager.addAuthAndLink(did)
              console.log('link account', did)
              manager.addAuthAndLink(did).then(
                (res) => {
                  console.log('created link', did, res)
                  notify('3id-connect-callback')
                },
                (err) => {
                  console.warn('link creation error', err)
                },
              )
            }}
          />
        </Box>
      </Box>
      <Box border={{ color: 'neutral-5', side: 'top' }} pad="medium">
        {displayAccounts}
      </Box>
    </Box>
  )
}

export type Props = {
  dids: DIDsData
  manager: Manage3IDs
}

export default function IdentitiesList({ dids, manager }: Props) {
  const items = Object.entries(dids).map(([did, data]) => (
    <IdentityItem key={did} data={data} did={did} manager={manager} />
  ))
  return <>{items}</>
}
