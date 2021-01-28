import { resolve } from 'path'
import Ceramic from '@ceramicnetwork/http-client'
import { publishIDXConfig } from '@ceramicstudio/idx-tools'

const PAGE_PATH = resolve(__dirname, 'env/app.html')

const MNEMONIC = 'pumpkin urban connect assume cluster drop aware frog journey answer conduct harsh'

beforeAll(async () => {
  const ceramic = new Ceramic('http://localhost:7777')
  await publishIDXConfig(ceramic)
})

describe('connect flow', () => {
  jest.setTimeout(60000)

  beforeEach(async () => {
    await jestPlaywright.resetContext()
    await page.goto('file://' + PAGE_PATH)
  })

  test('access 3ID connect iframe', async () => {
    const frame = await page.frame('threeid-connect')
    expect(frame).toBeDefined()
  })

  test('create account', async () => {
    // Ensure 3ID Connect iframe is present
    const frame = await page.frame('threeid-connect')

    // Run account creation flow in page
    const accountCreatedPromise = page.evaluate((mnemonic) => {
      const wallet = window.createWallet(mnemonic)
      const provider = window.createAuthProvider(wallet)
      return window.threeIdConnect.connect(provider).then(() => {
        return window.threeIdConnect.createAccount()
      })
    }, MNEMONIC)

    // 3ID Connect popup should show up with continue button
    const button = await frame.waitForSelector('#accept')
    await button.click()
    await page.waitForSelector('.threeid-connect', { state: 'hidden' })

    // Wait for account creation flow to be completed and check localStorage contents
    await accountCreatedPromise
    const accountsState = await frame.evaluate(() => localStorage.getItem('accounts'))
    expect(accountsState).toMatchSnapshot()
  })

  test('get DID provider', async () => {
    // Ensure 3ID Connect iframe is present
    const frame = await page.frame('threeid-connect')

    // Get DID string from in-page calls
    const didPromise = page.evaluate((mnemonic) => {
      return window.authenticateDID(mnemonic).then((did) => did.id)
    }, MNEMONIC)

    // 3ID Connect popup should show up with continue button
    const button = await frame.waitForSelector('#accept')
    await button.click()
    await expect(didPromise).resolves.toBeDefined()

    // Check localStorage contents
    const accountsState = await frame.evaluate(() => localStorage.getItem('accounts'))
    expect(accountsState).toMatchSnapshot()
  })

  test('link existing account - accept', async () => {
    // Ensure 3ID Connect iframe is present
    const frame = await page.frame('threeid-connect')

    // First create a DID with a random wallet
    const didCreatedPromise = page.evaluate(() => {
      return window.authenticateDID().then((did) => did.id)
    })

    // 3ID Connect popup should show up with continue button
    const buttonCreate = await frame.waitForSelector('#accept')
    await buttonCreate.click()
    const didCreated = await didCreatedPromise

    // Connect with another account
    const didLinkedPromise = page.evaluate(() => {
      return window.authenticateDID().then((did) => did.id)
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
      return window.authenticateDID().then((did) => did.id)
    })

    // 3ID Connect popup should show up with continue button
    const buttonCreate = await frame.waitForSelector('#accept')
    await buttonCreate.click()
    const didCreated = await didCreatedPromise

    // Connect with another account
    const otherDIDPromise = page.evaluate(() => {
      return window.authenticateDID().then((did) => did.id)
    })

    // Decline linking in 3ID Connect popup
    const buttonLink = await frame.waitForSelector('#decline')
    await buttonLink.click()
    const otherDID = await otherDIDPromise

    // new DID should not be the same
    expect(otherDID).not.toBe(didCreated)
  })
})
