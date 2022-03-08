import type { Manager } from '@3id/did-manager'
import { Avatar, Box, Text } from 'grommet'
import { useMemo } from 'react'

import Button from '../../components/Button'
import { formatDID, getImageSrc, longFormatDID } from '../../data/idx'
import avatarPlaceholder from '../../images/avatar-placeholder.png'
import { ACCENT_COLOR } from '../../theme'
import type { DIDData, DIDsData } from '../../types'

import { notifyDone } from '../connect'
import { useEthereum } from '../hooks'

type ItemProps = {
  data: DIDData
  did: string
  manager: Manager
}

function IdentityItem({ data, did, manager }: ItemProps) {
  const { accounts, profile } = data
  const [ethereum] = useEthereum()

  const avatarSrc = useMemo(() => {
    return profile?.image
      ? getImageSrc(profile.image, { height: 65, width: 65 })
      : avatarPlaceholder.src
  }, [profile])

  let hasConnectedAccount = false
  const displayAccounts = accounts.map((account) => {
    const isConnectedAccount = account.address === ethereum?.account.address
    hasConnectedAccount = hasConnectedAccount || isConnectedAccount
    return (
      <Text key={account.toString()} color={'neutral-3'}>
        {account.toString()}
      </Text>
    )
  })

  const renderName = () => {
    if (profile?.name) {
      return (
        <>
          <Text weight="bold">{profile.name}</Text>
          <Text color="neutral-4">{formatDID(did)}</Text>
        </>
      )
    } else {
      return (
        <>
          <Text weight="bold">{longFormatDID(did)}</Text>
        </>
      )
    }
  }

  return (
    <Box border={{ color: 'neutral-5' }} margin={{ bottom: 'medium' }} round="small">
      <Box direction="row" gap="small" pad="medium">
        <Avatar size="65px" src={avatarSrc} />
        <Box flex>{renderName()}</Box>
        <Box>
          <Button
            primary
            color={ACCENT_COLOR}
            label="Link"
            onClick={() => {
              console.log('link account', did)
              manager.addAuthAndLink(did).then(
                (res) => {
                  console.log('created link', did, res)
                  notifyDone()
                },
                (err) => {
                  console.warn('link creation error', err)
                }
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
  manager: Manager
}

export default function IdentitiesList({ dids, manager }: Props) {
  const items = Object.entries(dids).map(([did, data]) => (
    <IdentityItem key={did} data={data} did={did} manager={manager} />
  ))
  return <>{items}</>
}
