import { createClient, createServer } from '../src'

describe('iframe-rpc', () => {
  test('exports createClient and createServer', () => {
    expect(createClient).toBeDefined()
    expect(createServer).toBeDefined()
  })
})
