import { Text } from 'grommet'

import { useDIDsData, useRemoteProxy } from '../hooks'

import IdentitySelect from './IdentitySelect'

export default function ClientIdentitySelect() {
  const proxy = useRemoteProxy()
  const data = useDIDsData()

  return data && proxy ? (
    <IdentitySelect dids={data} manager={proxy.manager} />
  ) : (
    <Text>Loading...</Text>
  )
}
