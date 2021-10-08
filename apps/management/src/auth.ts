import {
  FortmaticConnector,
  InjectedConnector,
  PortisConnector,
  TorusConnector,
  WalletConnectConnector,
} from '@ceramicstudio/multiauth'
import type { PartialConnectorConfig } from '@ceramicstudio/multiauth'

import { NETWORK } from './constants'

const CHAIN_ID = NETWORK === 'mainnet' ? 1 : 3
const INFURA_NETWORK = NETWORK === 'mainnet' ? 'mainnet' : 'ropsten'

export const connectors: Array<PartialConnectorConfig> = [
  {
    key: 'injected',
    connector: new InjectedConnector({}),
  },
  {
    key: 'walletConnect',
    connector: new WalletConnectConnector({
      rpc: {
        [CHAIN_ID]: `https://${INFURA_NETWORK}.infura.io/v3/75268dd2c30045c899f4c03e53c4c892`,
      },
    }),
  },
  {
    key: 'fortmatic',
    connector: new FortmaticConnector({
      apiKey: NETWORK === 'mainnet' ? 'pk_live_521FB10247F1D4A8' : 'pk_test_8746B73847A300E9',
      chainId: CHAIN_ID,
    }),
  },
  {
    key: 'portis',
    connector: new PortisConnector({
      dAppId: '6e049157-9a0c-4883-a5cd-c354507c3a20',
      networks: [CHAIN_ID],
    }),
  },
  {
    key: 'torus',
    connector: new TorusConnector({
      chainId: CHAIN_ID,
      initOptions: { showTorusButton: false },
    }),
  },
]
