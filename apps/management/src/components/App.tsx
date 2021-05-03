import { Provider } from '@ceramicstudio/multiauth'
import { Box, Grommet, Text } from 'grommet'

import { useRemoteProxy, useDIDsData } from '../hooks'

import { theme } from '../theme'

import IdentitySelect from './IdentitySelect'

export default function App() {
  const proxy = useRemoteProxy()
  const data = useDIDsData()

  const contents =
    data && proxy ? <IdentitySelect dids={data} manager={proxy.manager} /> : <Text>Loading...</Text>

  return (
    <Grommet full theme={theme}>
      <Provider>
        <Box>
          <Box alignSelf="center" margin="large" width="large">
            {contents}
          </Box>
        </Box>
      </Provider>
    </Grommet>
  )
}
