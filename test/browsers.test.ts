import { resolve } from 'path'

// This needs to be in the test script
import AbstractAuthProvider from '../src/authProvider/abstractAuthProvider'
class TestAuthProvider extends AbstractAuthProvider {
  async authenticate(message: string, accountId): Promise<string> {}
}

// What else needs to be in the test script to initalize the provider?

beforeAll(async () => {
  const pagePath = resolve(__dirname, '../example/index.html')
  await page.goto('file://' + pagePath)
})

// TODO: mock auth provider

describe('connect flow', () => {
  test('access connect button', async () => {
    // await page.click('#bauth')
    // await page.waitForSelector('.threeid-connect')

    const frameElementHandle = await page.$('.threeid-connect')
    const frame = await frameElementHandle.contentFrame()
    console.log('got frame?', frame)

    // const frame = await page.frame('threeid-connect')
    // console.log('got frame?', frame)
    // const authButton = await page.$('#bauth')
    // await expect(authButton.textContent()).resolves.toBe('Connect')
  })
})
