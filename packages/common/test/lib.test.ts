import { ThreeIDError, assert, fromHex, toHex } from '../src'

describe('common', () => {
  test('exports', () => {
    expect(ThreeIDError).toBeDefined()
    expect(assert).toBeDefined()
    expect(fromHex).toBeDefined()
    expect(toHex).toBeDefined()
  })
})
