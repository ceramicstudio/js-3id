import type { ChainIDParams } from 'caip'

const CHAIN_IDS: Record<string, string> = {
  // Mainnet
  '0x01': '1',
  '0x1': '1',
  // Ropsten
  '0x03': '3',
  '0x3': '3',
  // Rinkeby
  '0x04': '4',
  '0x4': '4',
  // Goerli
  '0x05': '5',
  '0x5': '5',
  // Kovan
  '0x2a': '42',
}

export function toChainId(id: ChainIDParams | string | number): ChainIDParams {
  return typeof id === 'object'
    ? id
    : {
        namespace: 'eip155',
        reference: typeof id === 'number' ? id.toString() : CHAIN_IDS[id] || id,
      }
}
