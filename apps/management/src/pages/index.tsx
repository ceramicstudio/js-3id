import { Box, Text } from 'grommet'
import dynamic from 'next/dynamic'

const IdentitySelect = dynamic(() => import('../client/components/LoadIdentitySelect'), {
  loading: () => <Text>Loading...</Text>,
  ssr: false,
})

export default function Home() {
  return (
    <Box>
      <Box alignSelf="center" margin="large" width="large">
        <IdentitySelect />
      </Box>
    </Box>
  )
}
