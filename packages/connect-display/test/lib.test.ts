import { DisplayConnectClientRPC, createDisplayConnectServerRPC } from '../src'

describe('connect-display', () => {
  test('exports', () => {
    expect(DisplayConnectClientRPC).toBeDefined()
    expect(createDisplayConnectServerRPC).toBeDefined()
  })
})
