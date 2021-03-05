import type { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import { useWeb3React } from '@web3-react/core'
import { Avatar, Box, Button, Heading, Text } from 'grommet'
import { useMemo } from 'react'

import avatarPlaceholder from './images/avatar-placeholder.png'

import { useEthereumAccount, useProvidedData } from './hooks'
import { getImageSrc } from './idx'
import type { DIDData, DIDsData } from './types'

type ItemProps = {
  data: DIDData
  did: string
}

function IdentityItem({ data, did }: ItemProps) {
  const { accounts, profile } = data

  const providedData = useProvidedData()
  const web3 = useWeb3React<EthereumAuthProvider>()
  const [ethereumAccount, connectEthereum] = useEthereumAccount()

  const avatarSrc = useMemo(() => {
    return profile?.image
      ? getImageSrc(profile.image, { height: 65, width: 65 })
      : avatarPlaceholder
  }, [profile])

  let hasConnectedAccount = false
  const displayAccounts = accounts.map((account) => {
    const isConnectedAccount = account.address === ethereumAccount?.address
    hasConnectedAccount = hasConnectedAccount || isConnectedAccount

    return (
      <Text
        key={account.address}
        color={isConnectedAccount ? 'brand' : 'neutral-3'}>
        {account.address}
      </Text>
    )
  })

  const button = ethereumAccount ? (
    <Button
      disabled={!hasConnectedAccount}
      onClick={() => {
        if (providedData != null) {
          web3.library?.createLink(providedData.linkToDID).then(
            (link) => {
              console.log('created link', link)
            },
            (err) => {
              console.log('failed to create link', err)
            },
          )
        }
      }}
      plain>
      <Text color={hasConnectedAccount ? 'brand' : 'neutral-4'} weight="bold">
        Use this account
      </Text>
    </Button>
  ) : (
    <Button
      onClick={() => {
        connectEthereum()
      }}
      plain>
      <Text color="brand" weight="bold">
        Connect this account
      </Text>
    </Button>
  )

  return (
    <Box
      border={{ color: 'neutral-5' }}
      margin={{ bottom: 'medium' }}
      round="small">
      <Box direction="row" gap="small" pad="medium">
        <Avatar size="65px" src={avatarSrc} />
        <Box flex>
          <Text weight="bold">{profile?.name ?? '(no name)'}</Text>
          <Text color="neutral-4">{did}</Text>
        </Box>
        <Box>{button}</Box>
      </Box>
      <Box border={{ color: 'neutral-5', side: 'top' }} pad="medium">
        {displayAccounts}
      </Box>
    </Box>
  )
}

export type Props = {
  dids: DIDsData
}

export default function IdentitiesList({ dids }: Props) {
  const items = Object.entries(dids).map(([did, data]) => (
    <IdentityItem key={did} data={data} did={did} />
  ))

  return (
    <Box alignSelf="center" margin="large" width="large">
      <Heading textAlign="center">Choose an identity</Heading>
      {items}
    </Box>
  )
}
