import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import { Web3ReactProvider } from '@web3-react/core'
import { Box, Grommet, Text } from 'grommet'

import { useDIDsData } from './hooks'
import { theme } from './theme'

import IdentitiesList from './IdentitiesList'

function getLibrary(provider: any): EthereumAuthProvider {
  return new EthereumAuthProvider(provider, provider.selectedAddress)
}

export default function App() {
  const data = useDIDsData()
  const list = data ? <IdentitiesList dids={data} /> : <Text>Loading</Text>

  return (
    <Grommet full theme={theme}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Box>{list}</Box>
      </Web3ReactProvider>
    </Grommet>
  )
}
