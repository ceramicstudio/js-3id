import type { CeramicApi } from '@ceramicnetwork/common'
import type { TileLoader } from '@glazed/tile-loader'
import type { Resolver } from 'did-resolver'

import { DidProvider } from './did-provider.js'
import { Keychain } from './keychain.js'
import { Keyring } from './keyring.js'
import { Permissions, GetPermissionFn, SELF_ORIGIN } from './permissions.js'
import { ThreeIDX } from './three-idx.js'

type AuthConfig = { authId: string; authSecret: Uint8Array; seed?: never }
type SeedConfig = { authId?: never; authSecret?: never; seed: Uint8Array; did?: string }
// type SeedDidConfig = { authId?: never; authSecret?: never; seed: Uint8Array, did: string }

type ThreeIdProviderConfig = {
  getPermission: GetPermissionFn
  v03ID?: string
  ceramic: CeramicApi
  loader?: TileLoader
  resolver?: Resolver
} & (AuthConfig | SeedConfig)

export class ThreeIdProvider {
  #threeIdx: ThreeIDX
  #permissions: Permissions
  #keychain: Keychain

  /**
   * Use ThreeIdProvider.create() to create an ThreeIdProvider instance
   */
  constructor(threeIdx: ThreeIDX, permissions: Permissions, keychain: Keychain) {
    this.#threeIdx = threeIdx
    this.#permissions = permissions
    this.#keychain = keychain
  }

  /**
   * @property {Keychain} keychain          Edit the keychain
   */
  get keychain(): Keychain {
    return this.#keychain
  }

  /**
   * @property {Permissions} permissions    Edit permissions
   */
  get permissions(): Permissions {
    return this.#permissions
  }

  /**
   * @property {string} id                 The DID of the ThreeIdProvider instance
   */
  get id(): string {
    return this.#threeIdx.id
  }

  /**
   * Creates an instance of ThreeIdProvider
   *
   * @param     {Object}        config                  The configuration to be used
   * @param     {Function}      config.getPermission    The function that is called to ask the user for permission
   * @param     {CeramicApi}    config.ceramic          The ceramic instance to use
   * @param     {TileLoader}    config.loader           An optional TileLoader instance to use
   * @param     {Uint8Array}    config.seed             The seed of the 3ID, 32 bytes
   * @param     {Uint8Array}    config.authSecret       The authSecret to use, 32 bytes
   * @param     {String}        config.authId           The authId is used to identify the authSecret
   * @param     {Boolean}       config.disableIDX       Disable creation of the IDX document
   * @param     {String}        config.v03ID            A v0 3ID, has to be passed if a migration is being preformed
   * @return    {ThreeIdProvider}                       An ThreeIdProvider instance
   */
  static async create(config: ThreeIdProviderConfig): Promise<ThreeIdProvider> {
    if (config.seed && config.authSecret) throw new Error("Can't use both seed and authSecret")
    if (!config.seed && !config.authSecret) throw new Error('Either seed or authSecret is needed')
    if (config.authSecret && !config.authId) {
      throw new Error('AuthId must be given along with authSecret')
    }
    const threeIdx = new ThreeIDX(config.ceramic, config.loader)
    // Inject custom resolver for tests
    if (config.resolver != null) {
      threeIdx.resolver = config.resolver
    }
    const permissions = new Permissions(config.getPermission)
    const makeTmpProvider = (keyring: Keyring, forcedDID: string): DidProvider => {
      return new DidProvider({
        keyring,
        permissions,
        threeIdx,
        forcedOrigin: SELF_ORIGIN,
        forcedDID,
      })
    }
    let keychain
    if (config.seed) {
      if (typeof config.seed === 'string') throw new Error('seed needs to be Uint8Array')
      if (config.did) {
        keychain = await Keychain.loadFromSeed(threeIdx, config.seed, config.did, makeTmpProvider)
      } else {
        keychain = await Keychain.create(threeIdx, makeTmpProvider, config.seed, config.v03ID)
      }
    } else if (config.authSecret) {
      keychain = await Keychain.load(threeIdx, config.authSecret, makeTmpProvider)
    }
    permissions.did = threeIdx.id
    const provider = new ThreeIdProvider(threeIdx, permissions, keychain as Keychain)
    await provider.attachDIDProvider()
    if (config.authId && !(await keychain?.list())?.length) {
      // Add the auth method to the keychain
      await provider.keychain.add(config.authId, config.authSecret)
      await provider.keychain.commit()
    }
    return provider
  }

  async attachDIDProvider(): Promise<void> {
    await this.#threeIdx.setDIDProvider(this.getDidProvider(SELF_ORIGIN))
  }

  /**
   * Get the DIDProvider
   *
   * @return    {DidProvider}                   The DIDProvider for this ThreeIdProvider instance
   */
  getDidProvider(forcedOrigin?: string): DidProvider {
    return new DidProvider({
      keyring: this.#keychain.keyring,
      permissions: this.#permissions,
      threeIdx: this.#threeIdx,
      forcedOrigin,
    })
  }
}
