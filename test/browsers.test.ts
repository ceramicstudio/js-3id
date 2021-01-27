import { resolve } from 'path'
import Ceramic from '@ceramicnetwork/http-client'
import { publishIDXConfig } from '@ceramicstudio/idx-tools'

beforeAll(async () => {
  const ceramic = new Ceramic('http://localhost:7777')
  await publishIDXConfig(ceramic)

  const pagePath = resolve(__dirname, '../test-app/index.html')
  await page.goto('file://' + pagePath)
})

describe('connect flow', () => {
  jest.setTimeout(60000)

  test('access 3ID connect iframe', async () => {
    const frame = await page.frame('threeid-connect')
    expect(frame).toBeDefined()
  })

  test('trigger connect', async () => {
    // Ensure 3ID Connect iframe is present
    const frame = await page.frame('threeid-connect')

    // Create AuthProvider in page
    const providerHandle = await page.evaluateHandle((mnemonic) => {
      const wallet = window.createWallet(mnemonic)
      return window.createAuthProvider(wallet)
    }, 'pumpkin urban connect assume cluster drop aware frog journey answer conduct harsh')

    // Run account creation flow in page
    const accountCreatedHandlePromise = page.evaluateHandle((provider) => {
      return window.threeIdConnect.connect(provider).then(() => {
        return window.threeIdConnect.createAccount()
      })
    }, providerHandle)

    // 3ID Connect popup should show up with continue button
    const button = await frame.waitForSelector('#accept')
    await button.click()
    await page.waitForSelector('.threeid-connect', { state: 'hidden' })

    // Wait for account creation flow to be completed and check localStorage contents
    const accountCreatedHandle = await accountCreatedHandlePromise
    await expect(frame.evaluate(() => JSON.stringify(localStorage))).toMatchSnapshot()

    // Dispose of page handles
    await accountCreatedHandle.dispose()
    await providerHandle.dispose()
  })
})
