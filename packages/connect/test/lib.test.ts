import { DidProviderProxy, ThreeIdConnect } from '../src'

describe('connect', () => {
  test('exports', () => {
    expect(DidProviderProxy).toBeDefined()
    expect(ThreeIdConnect).toBeDefined()
  })
})
