/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return,  @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires */
import { assert, DIDRPCNameSpace } from '@3id/common'
import { DisplayManageClientRPC } from '@3id/connect-display'
import {
  Manager,
  legacyDIDLinkExist,
  willMigrationFail,
  Migrate3IDV0,
  waitMS,
} from '@3id/did-manager'
import { ThreeIdProvider } from '@3id/did-provider'
import { UIProvider, ThreeIDManagerUI } from '@3id/ui-provider'
import { AuthProviderClient } from '@3id/window-auth-provider'
import { DIDDataStore } from '@glazed/did-datastore'
import { RPCClient } from 'rpc-utils'
import Url from 'url-parse'
import { createServer } from '@ceramicnetwork/rpc-window'
import type {
  DIDProvider,
  DIDProviderMethods,
  GeneralJWS,
  CreateJWSParams,
  DecryptJWEParams,
  AuthParams,
} from 'dids'
import type { ServerPayload } from '@ceramicnetwork/rpc-window'
import type { Observable } from 'rxjs'

const DID_MIGRATION = process.env.MIGRATION ? process.env.MIGRATION === 'true' : false // default false

function createDIDProviderServer<NS extends string>(
  authHandler: (params: AuthParams, origin: string) => Promise<GeneralJWS>,
  relayHandler: <MethodName extends keyof DIDProviderMethods>(
    method: MethodName,
    params: DIDProviderMethods[MethodName]['params']
  ) => Promise<DIDProviderMethods[MethodName]['result']>,
  namespace = DIDRPCNameSpace
): Observable<ServerPayload<DIDProviderMethods, NS>> {
  return createServer<DIDProviderMethods, NS>(namespace as NS, {
    did_authenticate: async (_event, params: AuthParams) => {
      const origin = new Url(document.referrer).host
      return authHandler(params, origin)
    },
    did_createJWS: async (_event, params: CreateJWSParams & { did: string }) => {
      return relayHandler('did_createJWS', params)
    },
    did_decryptJWE: async (_event, params: DecryptJWEParams) => {
      return relayHandler('did_decryptJWE', params)
    },
  })
}

/**
 *  ConnectService runs a 3ID DID provider instance and rpc server with
 *  bindings to receive and relay rpc messages to identity wallet
 */
export class ThreeIDService {
  uiManager: ThreeIDManagerUI | undefined
  dataStore: DIDDataStore | undefined
  threeId: ThreeIdProvider | undefined
  provider: DIDProvider | undefined
  authProviderRelay: AuthProviderClient<string> | undefined
  didClient: RPCClient<DIDProviderMethods> | undefined

  manageApp: DisplayManageClientRPC | undefined

  /**
   *  Start connect service. Once returns ready to receive rpc requests
   *
   * @param     {Object}      uiProvider           A uiProvider instance
   * @param     {Function}    cancel               Function to cancel request, consumes callback, which is called when request is cancelled (cb) => {...}
   * @param     {Network}     network              Network to run service on, testnet-clay, dev-unstable, local and mainnet are supported or API url
   */
  start(uiProvider: UIProvider, dataStore: DIDDataStore): void {
    this.uiManager = new ThreeIDManagerUI(uiProvider)
    this.dataStore = dataStore
    this.manageApp = new DisplayManageClientRPC()
    createDIDProviderServer(this._didAuthReq.bind(this), this._relayDidReq.bind(this)).subscribe()
  }

  async init(accountId: string, authParams: AuthParams, origin: string): Promise<void> {
    assert.isDefined(this.uiManager, 'UI Manager must be defined')
    assert.isDefined(this.manageApp, 'manageApp must be defined')
    assert.isDefined(this.dataStore, 'dataStore must be defined')
    assert.isDefined(this.authProviderRelay, 'authProviderRelay must be defined')

    const manage = new Manager(this.authProviderRelay, { dataStore: this.dataStore })

    //TODO if exist in state, return before even looking up links
    const existLocally = await manage.cache.getLinkedDid(accountId)

    const existNetwork = !existLocally
      ? await Promise.race([manage.linkInNetwork(accountId), waitMS(1500)])
      : existLocally

    const newAccount = !existNetwork && !existLocally

    // Await during user prompt, only lookup legacy if no link in network already
    const legacyDidPromise = !DID_MIGRATION || existNetwork ? Promise.resolve(null) : legacyDIDLinkExist(accountId)

    // Before to give context, and no 3id-did-provider permission exist
    if (!existLocally && !newAccount) {
      await this.userPermissionRequest(authParams, origin)
    }

    //TODO if not exist locally and not in network, then skip first modal aboev, and merge below with create

    let legacyDid

    try {
      legacyDid = await legacyDidPromise
    } catch (e) {
      legacyDid = null
    }

    let muportDid

    if (legacyDid) {
      await this.userPermissionRequest(authParams, origin, legacyDid)
    }

    // For legacy muport dids, do not migrate, create new did, but still try to migrate profile data
    if (legacyDid && legacyDid.includes('muport')) {
      muportDid = legacyDid
      legacyDid = null
    }

    // For known failure cases, skip migrations prompts
    let willFail
    if (legacyDid) {
      willFail = await willMigrationFail(accountId, legacyDid)
      if (willFail) legacyDid = null
    }

    // If new account (and not migration), ask user to link or create
    if (!(legacyDid || muportDid || willFail) && newAccount) {
      const createNew = (await this.uiManager.promptAccount({ caip10: accountId })).createNew
      if (!createNew) {
        await this.manageApp.display(accountId)
      }
    }

    if (DID_MIGRATION && newAccount && legacyDid && !willFail) {
      await this.uiManager.promptMigration({ legacyDid, caip10: accountId })
    }

    let did: string
    try {
      // Skip migration if muport or known failure
      const skipMigration = Boolean(muportDid || willFail)
      const createConfig = legacyDid ? { legacyDid, skipMigration } : { skipMigration }
      did = await manage.createAccount(createConfig)
    } catch (e) {
      if (legacyDid) {
        await this.uiManager.promptMigrationFail({ caip10: accountId })
        // If migration fails, continue with new did instead
        did = await manage.createAccount({ skipMigration: true })
      } else {
        console.error(e)
        throw e
      }
    }

    this.threeId = manage.threeIdProviders[did]
    const provider = this.threeId.getDidProvider(origin)
    this.didClient = new RPCClient<DIDProviderMethods>(provider)

    if (muportDid) {
      //Try to migrate profile data still for muport did
      try {
        const migration = new Migrate3IDV0(provider, manage.dataStore)
        await migration.migrate3BoxProfile(muportDid)
      } catch (e) {
        // If not available, continue
      }
    }

    // After since 3id-did-provider permissions may exist
    if (existLocally) {
      await this.userPermissionRequest(authParams, origin, did)
    }
  }

  async userPermissionRequest(authParams: AuthParams, origin: string, did?: string): Promise<void> {
    assert.isDefined(this.uiManager, 'User request handler must be defined')
    if (this.threeId) {
      const has = authParams.paths ? this.threeId.permissions.has(origin, authParams.paths) : true
      if (has) return
    }
    const userPermission = await this.uiManager.promptAuthenticate({
      paths: authParams.paths,
      origin,
      did,
    })
    if (!userPermission) throw new Error('3id-connect: Request not authorized')
  }

  async _didAuthReq(params: AuthParams, origin: string): Promise<GeneralJWS> {
    assert.isDefined(this.uiManager, 'A uiManager must be defined')
    this.authProviderRelay = new AuthProviderClient(window.parent)

    try {
      const accountId = (await this.authProviderRelay.accountId()).toString()
      await this.init(accountId, params, origin)
      const resPromise = this._relayDidReq('did_authenticate', params)
      void this.uiManager.noftifyClose()
      return resPromise
    } catch (e) {
      const err = (e as Error).toString()
      if (err.includes('authorized') || err.includes('cancellation')) {
        void this.uiManager.noftifyClose()
        throw new Error('Request cancelled')
      }
      console.log(err)
      void this.uiManager.noftifyError({ code: 0, message: 'Error: Unable to connect' })
      throw new Error('Request failed')
    }
  }

  async _relayDidReq<MethodName extends keyof DIDProviderMethods>(
    method: MethodName,
    params: DIDProviderMethods[MethodName]['params']
  ): Promise<DIDProviderMethods[MethodName]['result']> {
    assert.isDefined(this.didClient, 'DID client must be defined')
    return this.didClient.request(method, params)
  }
}
