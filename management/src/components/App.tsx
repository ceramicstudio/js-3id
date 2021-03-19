import { Web3ReactProvider } from '@web3-react/core'
import { Box, Grommet, Text } from 'grommet'

import { useConnectRemoteProxy, useDIDsData } from '../hooks'

import { theme } from '../theme'

import IdentitySelect from './IdentitySelect'

function getLibrary(provider: any): any {
  return provider
}

export default function App() {
  const proxy = useConnectRemoteProxy()
  const data = useDIDsData()

  const contents =
    data && proxy ? (
      <IdentitySelect dids={data} manager={proxy.manager} />
    ) : (
      <Text>Loading...</Text>
    )

  return (
    <Grommet full theme={theme}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Box>
          <Box alignSelf="center" margin="large" width="large">
            {contents}
          </Box>
        </Box>
      </Web3ReactProvider>
    </Grommet>
  )
}
