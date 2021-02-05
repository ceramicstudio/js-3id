import { resolve } from 'path'
import Ceramic from '@ceramicnetwork/http-client'
import { publishIDXConfig } from '@ceramicstudio/idx-tools'

const PAGE_PATH = resolve(__dirname, 'env/app.html')

beforeAll(async () => {
  const ceramic = new Ceramic('http://localhost:7777')
  await publishIDXConfig(ceramic)
})

describe('connect flow', () => {
  jest.setTimeout(60000)

  beforeEach(async () => {
    await jestPlaywright.resetContext()
    await page.goto('file://' + PAGE_PATH)
    // page.on('console', (consoleObj) => console.log(consoleObj.text()))
  })

  test('access 3ID connect iframe', async () => {
    const frame = await page.frame('threeid-connect')
    expect(frame).toBeDefined()
  })

  test('create account', async () => {
    // Ensure 3ID Connect iframe is present
    const frame = await page.frame('threeid-connect')

    // Run account creation flow in page
    const accountCreatedPromise = page.evaluate(() => {
      const provider = window.createEthereumAuthProvider()
      return window.threeIdConnect.connect(provider).then(() => {
        return window.threeIdConnect.createAccount().then(() => {
          return provider.accountId().then((id) => id.toString())
        })
      })
    })

    // 3ID Connect popup should show up with continue button
    const button = await frame.waitForSelector('#accept')
    await button.click()
    await page.waitForSelector('.threeid-connect', { state: 'hidden' })

    // Wait for account creation flow to be completed and check localStorage contents
    const accountId = await accountCreatedPromise
    const accountsState = await frame.evaluate(() => localStorage.getItem('accounts'))
    expect(JSON.parse(accountsState)).toEqual({ [accountId]: expect.any(String) })
  })

  test('get DID provider', async () => {
    // Ensure 3ID Connect iframe is present
    const frame = await page.frame('threeid-connect')

    // Get DID and account from in-page calls
    const didAccountPromise = page.evaluate(() => {
      const provider = window.createEthereumAuthProvider()
      return window.authenticateDID(provider).then((did) => {
        return provider.accountId().then((accountId) => {
          return [did.id, accountId.toString()]
        })
      })
    })

    // 3ID Connect popup should show up with continue button
    const button = await frame.waitForSelector('#accept')
    await button.click()
    const [did, account] = await didAccountPromise

    // Check localStorage contents
    const linksState = await frame.evaluate(() => localStorage.getItem('links'))
    expect(linksState).toBe(JSON.stringify({ [did]: [account] }))
  })

  test('link existing account - accept', async () => {
    // Ensure 3ID Connect iframe is present
    const frame = await page.frame('threeid-connect')

    // First create a DID with a random wallet
    const didCreatedPromise = page.evaluate(() => {
      const provider = window.createEthereumAuthProvider()
      return window.authenticateDID(provider).then((did) => did.id)
    })

    // 3ID Connect popup should show up with continue button
    const buttonCreate = await frame.waitForSelector('#accept')
    await buttonCreate.click()
    const didCreated = await didCreatedPromise

    // Connect with another account
    const didLinkedPromise = page.evaluate(() => {
      const provider = window.createEthereumAuthProvider()
      return window.authenticateDID(provider).then((did) => did.id)
    })

    // Accept linking in 3ID Connect popup
    const buttonLink = await frame.waitForSelector('#accept')
    await buttonLink.click()
    const didLinked = await didLinkedPromise

    // DID should be the same
    expect(didLinked).toBe(didCreated)
  })

  test('link existing account - decline', async () => {
    // Ensure 3ID Connect iframe is present
    const frame = await page.frame('threeid-connect')

    // First create a DID with a random wallet
    const didCreatedPromise = page.evaluate(() => {
      const provider = window.createEthereumAuthProvider()
      return window.authenticateDID(provider).then((did) => did.id)
    })

    // 3ID Connect popup should show up with continue button
    const buttonCreate = await frame.waitForSelector('#accept')
    await buttonCreate.click()
    const didCreated = await didCreatedPromise

    // Connect with another account
    const otherDIDPromise = page.evaluate(() => {
      const provider = window.createEthereumAuthProvider()
      return window.authenticateDID(provider).then((did) => did.id)
    })

    // Decline linking in 3ID Connect popup
    const buttonLink = await frame.waitForSelector('#decline')
    await buttonLink.click()
    const otherDID = await otherDIDPromise

    // new DID should not be the same
    expect(otherDID).not.toBe(didCreated)
  })
})
