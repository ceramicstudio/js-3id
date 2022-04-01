import Ceramic from '@ceramicnetwork/http-client'
import { publishIDXConfig } from '@ceramicstudio/idx-tools'
import { IDX } from '@ceramicstudio/idx'

const PROVIDERS = ['ethereum']

const ceramic = new Ceramic('http://localhost:7777')
beforeAll(async () => {
  await publishIDXConfig(ceramic)
})

describe('connect flow', () => {
  jest.setTimeout(240000)

  beforeEach(async () => {
    await jestPlaywright.resetContext()
    await page.goto('http://localhost:30000/app.html')
    page.setDefaultTimeout(240000)
    // page.on('console', (consoleObj) => console.log(consoleObj.text()))
  })

  test('access 3ID connect iframe', async () => {
    const frame = await page.frame('threeid-connect')
    expect(frame).toBeDefined()
  })

  PROVIDERS.forEach((providerType) => {
    describe(providerType, () => {
      test('create account and get DID provider', async () => {
        // Ensure 3ID Connect iframe is present
        const frame = await page.frame('threeid-connect')

        // Get DID and account from in-page calls
        const didAccountPromise = page.evaluate((type) => {
          return window.createAuthProvider(type).then((provider) => {
            console.log(provider)
            return window.authenticateDID(provider).then((did) => {
              console.log(did)
              return provider.accountId().then((accountId) => {
                return [did.id, accountId.toString()]
              })
            })
          })
        }, providerType)

        // Continue create account
        const buttontwo = await frame.waitForSelector('#decline')
        await buttontwo.click()
        await page.waitForSelector('.threeid-connect', { state: 'hidden' })

        const [did, account] = await didAccountPromise

        // Check localStorage contents
        const linksState = await frame.evaluate(
          (key) => localStorage.getItem(key),
          `LINK_${account}`
        )
        expect(JSON.parse(linksState)).toBe(did)

        const accountsState = await frame.evaluate((key) => localStorage.getItem(key), `ACC_${did}`)
        expect(accountsState).toBeTruthy()
      })
    })
  })

  // requires no prior ceramic document state to run, run in one browser, or clear ceramic node doc set before running in each browser
  describe.jestPlaywrightSkip(
    { browsers: ['firefox', 'webkit'] },
    'Ethereum didv0 Migration',
    () => {
      //TODO maybe useful to run with all auth provs above as well, though this has diff ui needs at moment
      test('migrate v0 did to did v0 and 3box to IDX profile', async () => {
        const frame = await page.frame('threeid-connect')

        // Get DID and account from in-page calls
        const didAccountPromise = page.evaluate((type) => {
          return window.createAuthProvider(type).then((provider) => {
            return window.authenticateDID(provider).then((did) => {
              return provider.accountId().then((accountId) => {
                return [did.id, accountId.toString()]
              })
            })
          })
        }, 'ethereumMockMigration')

        // Continue button
        const button = await frame.waitForSelector('#accept')
        await button.click()
        await new Promise((res) =>
          setTimeout(() => {
            res()
          }, 1000)
        )

        // Continue migration button
        const buttontwo = await frame.waitForSelector('#accept')
        await buttontwo.click()
        await page.waitForSelector('.threeid-connect', { state: 'hidden' })

        const [did, account] = await didAccountPromise
        // didv0 cid prefix
        expect(did.includes('did:3:bafy')).toBeTruthy()

        const idx = new IDX({ ceramic })
        const migratedProfile = await idx.get('basicProfile', did)
        expect(migratedProfile).toMatchSnapshot()

        const links = await idx.get('cryptoAccounts', did)
        expect(links).toMatchSnapshot()

        const aka = await idx.get('alsoKnownAs', did)

        // twitter & github
        expect(aka.accounts[0].claim).toMatchSnapshot()
        expect(aka.accounts[1].claim).toMatchSnapshot()

        // Check localStorage contents
        const linksState = await frame.evaluate(
          (key) => localStorage.getItem(key),
          `LINK_${account}`
        )
        expect(JSON.parse(linksState)).toBe(did)
      })
    }
  )
})
