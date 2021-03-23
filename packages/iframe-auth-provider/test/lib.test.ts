import { AuthProviderClient, createAuthProviderServer } from '../src'

describe('iframe-auth-provider', () => {
  test('exports AuthProviderClient and createAuthProviderServer', () => {
    expect(AuthProviderClient).toBeDefined()
    expect(createAuthProviderServer).toBeDefined()
  })
})
