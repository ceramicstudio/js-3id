/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import { ThreeIDError, assert } from '@3id/common'
import { DisplayManageClientRPC } from '@3id/connect-display'
import { Manager, legacyDIDLinkExist, willMigrationFail, Migrate3IDV0 } from '@3id/manager'
import { AuthProviderClient } from '@3id/window-auth-provider'
import CeramicClient from '@ceramicnetwork/http-client'
import { IDX } from '@ceramicstudio/idx'
import ThreeIdProvider from '3id-did-provider'
import type { DIDMethodName, DIDProvider, DIDProviderMethods, DIDRequest, DIDResponse } from 'dids'
import type { RPCErrorObject, RPCRequest, RPCResponse, RPCResultResponse } from 'rpc-utils'
import Url from 'url-parse'

import { IframeService } from './iframeService'
import type {
  UserAuthenticateRequest,
  UserRequestHandler,
  UserRequestErrorCallback,
  UserRequestCancel,
} from './types'
import { rpcError } from './utils'

const CERAMIC_API = process.env.CERAMIC_API || 'https://ceramic-private.3boxlabs.com'
const DID_MIGRATION = process.env.MIGRATION ? process.env.MIGRATION === 'true' : true // default true

// Any other supported method?
type Methods = DIDProviderMethods

/**
 *  ConnectService runs a 3ID DID provider instance and rpc server with
 *  bindings to receive and relay rpc messages to identity wallet
 */
export class ConnectService extends IframeService<DIDProviderMethods> {
  userRequestHandler: UserRequestHandler | undefined
  cancel: UserRequestCancel | undefined
  errorCb: UserRequestErrorCallback | undefined

  ceramic: CeramicClient | undefined
  threeId: ThreeIdProvider | undefined
  idx: IDX | undefined
  provider: DIDProvider | undefined

  manageApp: DisplayManageClientRPC | undefined

  /**
   *  Start connect service. Once returns ready to receive rpc requests
   *
   * @param     {Function}    userRequestHandler   Function to handle request for user (in user interface/modal)
   * @param     {Function}    errorCB              Function to handle errors, function consumes error string (err) => {...}, called on errors
   * @param     {Function}    cancel               Function to cancel request, consumes callback, which is called when request is cancelled (cb) => {...}
   */
  // @ts-ignore method override
  start(
    userRequestHandler: UserRequestHandler,
    errorCb: UserRequestErrorCallback,
    cancel: UserRequestCancel
  ): void {
    this.cancel = cancel
    this.errorCb = errorCb
    this.userRequestHandler = userRequestHandler
    this.ceramic = new CeramicClient(CERAMIC_API, { syncInterval: 30 * 60 * 1000 })
    super.start(this.requestHandler.bind(this))
    this.manageApp = new DisplayManageClientRPC()
  }

  async init(
    accountId: string,
    authReq: DIDRequest<'did_authenticate'>,
    domain?: string | null
  ): Promise<void> {
    assert.isDefined(this.userRequestHandler, 'User request handler must be defined')
    assert.isDefined(this.manageApp, 'manageApp must be defined')

    const authProviderRelay = new AuthProviderClient(window.parent)
    const manage = new Manager(authProviderRelay, { ceramic: this.ceramic })

    //TODO if exist in state, return before even looking up links
    const existLocally = await manage.cache.getLinkedDid(accountId)
    const existNetwork = await manage.linkInNetwork(accountId)

    // await during prompt
    const legacyDidPromise = legacyDIDLinkExist(accountId)
  

    // before to give context, and no 3id-did-provider permission exist
    if (!existLocally || existNetwork) {
      await this.userPermissionRequest(authReq, domain)
    }

    let legacyDid = await legacyDidPromise
    let muportDid

    // For legacy muport dids, do not migrate, create new did, but still try to migrate profile data
    if (legacyDid && legacyDid.includes('muport')) {
      muportDid = legacyDid
      legacyDid = null
    }

    // For known failure cases, skip migrations prompts, can not easily resolve issues here
    if (legacyDid) {
      const willFail = await willMigrationFail(legacyDid)
      if (willFail) legacyDid = null
    }

    if (!legacyDid && (!existLocally && !existNetwork)) {
      const LinkHuh = await this.userRequestHandler({ type: 'account', accounts: [] })
      if (LinkHuh) {
        await this.manageApp.display(accountId)
      }
    }

    // TODO if muport, may show different message, or communicate other migration info here
    if (DID_MIGRATION && legacyDid && (!existLocally && !existNetwork)) {
      await this.userRequestHandler({ type: 'migration', legacyDid, muportDid })
    }

    let did
    try {
      did = await manage.createAccount({ legacyDid, skipMigration: Boolean(muportDid) })
    } catch(e) {
      if (legacyDid) {
        await this.userRequestHandler({ type: 'migration_fail', legacyDid })
        did = await manage.createAccount({ skipMigration: true })
      } else {
        console.error(e)
        throw new Error(e)
      }
    }

    this.threeId = manage.threeIdProviders[did]
    this.provider = this.threeId.getDidProvider() as DIDProvider

    if (muportDid) {
      //try to migrate profile data still
      try {
        const migration = new Migrate3IDV0(this.provider , manage.idx)
        await migration.migrate3BoxProfile(muportDid)
      } catch (e) {
        // if not available, continue
      }
    }

    // after since 3id-did-provider permissions may exist
    if (existLocally && !existNetwork) {
      await this.userPermissionRequest(authReq, domain, did)
    }
  }

  async userPermissionRequest(authReq: DIDRequest, domain?: string | null, did?:string): Promise<void> {
    assert.isDefined(this.userRequestHandler, 'User request handler must be defined')
    this.cancel!(() => {throw new Error('3id-connect: Request not authorized')})
    const userReq = this._createUserRequest(authReq, domain, did)
    if (!userReq) return
    const userPermission = userReq ? await this.userRequestHandler(userReq) : null
    if (!userPermission) throw new Error('3id-connect: Request not authorized')
  }

  async requestHandler(message: RPCRequest<Methods, keyof Methods>): Promise<string> {
    const domain = new Url(document.referrer).host

    const responsePromise = new Promise((resolve, reject) => {
      // Register request cancel calback
      this.cancel!(() => resolve(rpcError(message.id!)))
      if (message.method.startsWith('did')) {
        this.requestHandlerDid(message, domain).then(resolve, reject)
      } else {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const msg = `Unsupported method ${message.method}: only did_ and 3id_ methods are supported`
        reject(new ThreeIDError(4, msg))
      }
    })

    return JSON.stringify(await responsePromise)
  }

  /**
   *  Consumes DID RPC request message and relays to IDW didprovider instance. Also handles
   *  logic to retry requests and cancel requests.
   *
   * @param     {Object}      message    DID RPC request message
   * @return    {String}                 response message string
   */

  async requestHandlerDid<K extends DIDMethodName>(
    message: DIDRequest<K>,
    domain?: string
  ): Promise<
    K extends 'did_authenticate'
      ? RPCResultResponse<DIDProviderMethods['did_authenticate']['result']> | RPCErrorObject | void
      : DIDResponse<K> | null
  > {
    return message.method === 'did_authenticate'
      ? ((await this._didAuthReq(message as DIDRequest<'did_authenticate'>, domain)) as any)
      : await this._relayDidReq(message, domain)
  }

  async _didAuthReq(
    message: RPCRequest<DIDProviderMethods, 'did_authenticate'>,
    domain?: string | null
  ): Promise<
    | RPCResultResponse<DIDProviderMethods['did_authenticate']['result']>
    | RPCErrorObject
    | null
    | void
  > {
    assert.isDefined(this.errorCb, 'Error callback must be defined')
    assert.isDefined(message.params, 'Message parameters must be defined')

    try {
      const accountId = ((message.params as unknown) as { accountId: string }).accountId

      await this.init(accountId, message, domain)

      assert.isDefined(this.provider, 'DID provider must be defined')
      const res = await this.provider.send(message, domain)
      await this.hideIframe()
      return res as RPCResultResponse<DIDProviderMethods['did_authenticate']['result']>
    } catch (e) {
      if ((e as Error).toString().includes('authorized')) {
        await this.hideIframe()
        return rpcError(message.id!)
      }
      this.errorCb(e, 'Error: Unable to connect')
    }
  }

  async _relayDidReq<K extends keyof DIDProviderMethods>(
    req: RPCRequest<DIDProviderMethods, K>,
    domain?: string | null
  ): Promise<RPCResponse<DIDProviderMethods, K> | null> {
    assert.isDefined(this.provider, 'DID provider must be defined')
    return await this.provider.send(req, domain)
  }

  _createUserRequest<K extends keyof DIDProviderMethods>(
    req: RPCRequest<DIDProviderMethods, K>,
    origin?: string | null,
    did?: string
  ): UserAuthenticateRequest | null {
    assert.isDefined(req.params, 'Request parameters must be provided')
    const params = req.params as DIDProviderMethods[K]['params'] & { paths?: Array<string> }

    if (this.threeId) {
      const has = params.paths ? this.threeId.permissions.has(origin, params.paths) : true
      if (has) return null
    }

    return {
      type: 'authenticate',
      origin,
      paths: params.paths || [],
      did: did || ''
    }
  }
}
