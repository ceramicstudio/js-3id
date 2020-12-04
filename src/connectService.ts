/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import CeramicClient from '@ceramicnetwork/http-client'
import { IDX } from '@ceramicstudio/idx'
import type { LinkProof } from '3id-blockchain-utils'
import ThreeIdProvider from '3id-did-provider'
import { sha256 } from 'js-sha256'
import { RPCError } from 'rpc-utils'
import type { RPCErrorObject, RPCRequest, RPCResponse } from 'rpc-utils'
import store from 'store'
import Url from 'url-parse'

import IframeService from './iframeService'
import { ConnectError, assert } from './errors'
import type {
  AccountsList,
  DIDLinksList,
  DIDProvider,
  UserAuthenticateRequest,
  UserLinkRequest,
  UserRequest,
  UserRequestHandler,
  UserRequestErrorCallback,
  UserRequestCancel,
} from './types'

type ThreeIDMethods = '3id_accounts' | '3id_createAccount' | '3id_addAuthAndLink'

const CERAMIC_API = 'https://ceramic-dev.3boxlabs.com'
const ACCOUNT_KEY = 'accounts'
const LINK_KEY = 'links'
const ACTIVE_ACCOUNT_KEY = 'active_account'

// TODO didprovider, auth failed codes?
const rpcError = (id: string | number) => {
  const rpcError = new RPCError(-32401, `3id-connect: Request not authorized`)
  return Object.assign(rpcError.toObject(), { id })
}

/**
 *  ConnectService runs a 3ID DID provider instance and rpc server with
 *  bindings to receive and relay rpc messages to identity wallet
 */
class ConnectService extends IframeService {
  userRequestHandler: UserRequestHandler | undefined
  cancel: UserRequestCancel | undefined
  errorCb: UserRequestErrorCallback | undefined

  ceramic: CeramicClient | undefined
  threeId: ThreeIdProvider | undefined
  idx: IDX | undefined
  provider: DIDProvider | undefined
  activeAccount: string | null = null

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
    this.ceramic = new CeramicClient(CERAMIC_API)
    super.start(this.requestHandler.bind(this))
  }

  // Simplified Assumptions
  // always asks for authsecret if not available locally, ie two accounts linked, first one already auth, will not look up link for second to see if same did, will ask for an authsecret again
  // when account hasnt seen, two options, link to "active account" or create new,
  // linking means add auth method and public link right now, but can unbundle, code currently assumes in places
  // better manage state for race conditions, two window active

  // TODO handle link state better, stores links now, but does not sync with network before lookup
  async init(
    accountId: string,
    authReq: RPCRequest<string, { paths?: Array<string> }>,
    domain?: string | null
  ): Promise<void> {
    assert.isDefined(this.userRequestHandler, 'User request handler must be defined')

    let authSecret = this.getStoredAccount(accountId)
    const accounts = this.getStoredAccountList()

    const accountAlreadyExist = Boolean(authSecret)
    const firstAccount = !accounts
    const otherAccountsExist = !authSecret && Boolean(accounts)

    let existInNetworkOnly
    if (!accountAlreadyExist) {
      // todo dont block visual modal with this
      existInNetworkOnly = Boolean(await this._resolveLink(accountId))
    }

    let authId = accountId
    let authSecretAdd = null

    if (firstAccount || existInNetworkOnly) {
      await this.userPermissionRequest(authReq, domain)
      authSecret = await this.authCreate(accountId)
    }

    if (otherAccountsExist && !authSecret) {
      // change request type, for now will link to "active account" (true) or create new, pass single account not array
      const defaultAccount = accounts?.[0]
      assert.isDefined(defaultAccount, 'A default account should be defined')
      const activeAccount = this.getActiveAccount() || defaultAccount
      const linkHuh = await this.userRequestHandler({ type: 'account', accounts: [activeAccount] })
      if (linkHuh) {
        authId = activeAccount
        authSecret = this.getStoredAccount(authId)
        authSecretAdd = await this.authCreate(accountId)
      } else {
        authSecret = await this.authCreate(accountId)
      }
    }

    assert.isDefined(authSecret, 'Auth secret should be defined to initialize identity')
    await this.initIdentity(authSecret, authId)

    if (otherAccountsExist && authSecretAdd) {
      await this.addAuth(accountId, authSecretAdd)
    }

    if (firstAccount || authSecretAdd || accountAlreadyExist || !existInNetworkOnly) {
      await this.tryCreateLink(accountId)
    }

    if (!firstAccount && !existInNetworkOnly) {
      await this.userPermissionRequest(authReq, domain)
    }

    this.setActiveAccount(accountId)
  }

  async initIdentity(authSecret: Uint8Array, authId: string): Promise<void> {
    assert.isDefined(this.ceramic, 'Ceramic instance must be defined')

    // Same request relayed before idw handles it, if request reaches idw, then permission given
    const getPermission = () => Promise.resolve([])

    this.threeId = await ThreeIdProvider.create({
      getPermission,
      ceramic: this.ceramic,
      authSecret,
      authId,
    })
    this.provider = this.threeId.getDidProvider() as DIDProvider
    await this.ceramic.setDIDProvider(this.provider as any)
    this.idx = new IDX({ ceramic: this.ceramic })
  }

  async tryCreateLink(accountId: string): Promise<void> {
    assert.isDefined(this.idx, 'IDX instance must be defined')
    assert.isDefined(this.threeId, 'ThreeIdProvider instance must be defined')

    const links: Record<string, string> | null = await this.idx.get('cryptoAccounts')
    if (links) this.storeDIDLinks(this.threeId.id, Object.keys(links))
    if (!(links && links[accountId])) await this.createLinkDoc(accountId)
  }

  async addAuth(accountId: string, authSecretAdd: Uint8Array): Promise<void> {
    assert.isDefined(this.threeId, 'ThreeIdProvider instance must be defined')

    await this.threeId.keychain.add(accountId, authSecretAdd)
    await this.threeId.keychain.commit()
  }

  async userPermissionRequest(
    authReq: RPCRequest<string, { paths?: Array<string> }>,
    domain?: string | null
  ): Promise<void> {
    assert.isDefined(this.userRequestHandler, 'User request handler must be defined')

    const userReq = this._createUserRequest(authReq, domain)
    if (!userReq) return
    const userPermission = userReq ? await this.userRequestHandler(userReq) : null
    if (!userPermission) throw new Error('3id-connect: Request not authorized')
  }

  async userPermissionRequest3id(req: UserRequest): Promise<void> {
    assert.isDefined(this.userRequestHandler, 'User request handler must be defined')

    const userPersmission = req ? await this.userRequestHandler(req) : null
    if (!userPersmission) throw new Error('3id-connect: Request not authorized')
  }

  /**
   *  Creates an authSecret to add auth method 3ID
   */
  async authCreate(accountId: string): Promise<Uint8Array> {
    const message = 'Add this account as a Ceramic authentication method'
    const authSecret = await this.authenticate(message)
    const entropy = sha256(authSecret.slice(2))
    this.storeAccount(accountId, entropy)
    return Uint8Array.from(Buffer.from(entropy, 'hex'))
  }

  /**
   *  Creates a publicly verifiable link between crypto account and 3id
   */
  async createLinkDoc(accountId: string): Promise<void> {
    assert.isDefined(this.ceramic, 'Ceramic instance must be defined')
    assert.isDefined(this.idx, 'IDX instance must be defined')
    assert.isDefined(this.threeId, 'ThreeIdProvider instance must be defined')

    const [linkProof, linkDoc] = await Promise.all([
      this.createLink(this.threeId.id),
      this.ceramic.createDocument(
        'caip10-link',
        { metadata: { controllers: [accountId] } },
        { anchor: false, publish: false }
      ),
    ])
    await linkDoc.change({ content: linkProof })
    await this.ceramic.pin.add(linkDoc.id)

    const existingLinks = (await this.idx.get('cryptoAccounts')) || {}
    const links = Object.assign(existingLinks, { [accountId]: linkDoc.id.toUrl() })
    await this.idx.set('cryptoAccounts', links)
    this.storeDIDLinks(this.threeId.id, [accountId])
  }

  async requestHandler(message: RPCRequest<string, Record<string, unknown>>): Promise<string> {
    const domain = new Url(document.referrer).host

    const responsePromise = new Promise((resolve, reject) => {
      // Register request cancel calback
      this.cancel!(() => resolve(rpcError(message.id!)))

      if (message.method.startsWith('did')) {
        this.requestHandlerDid(message, domain).then(resolve, reject)
      } else if (message.method.startsWith('3id')) {
        // @ts-ignore compiler doesn't seem to properly handle type
        this.requestHandler3id(message).then(resolve, reject)
      } else {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const msg = `Unsupported method ${message.method}: only did_ and 3id_ methods are supported`
        reject(new ConnectError(4, msg))
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

  async requestHandlerDid(
    message: RPCRequest<string, Record<string, unknown>>,
    domain?: string
  ): Promise<RPCResponse | RPCErrorObject | null | void> {
    return message.method === 'did_authenticate'
      ? await this._didAuthReq(message, domain)
      : await this._relayDidReq(message, domain)
  }

  async requestHandler3id(
    message: RPCRequest<ThreeIDMethods, Record<string, unknown>>
  ): Promise<{ result: any }> {
    //TODO throw if not selfid or localhost
    let res = null

    if (message.method === '3id_accounts') {
      res = await this._listAccounts()
    } else if (message.method === '3id_createAccount') {
      // @ts-ignore compiler doesn't seem to properly handle type
      res = await this._createAccount(message)
    } else if (message.method === '3id_addAuthAndLink') {
      // @ts-ignore compiler doesn't seem to properly handle type
      res = await this._addAuthAndLink(message)
    } else {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new ConnectError(5, `Unsupported 3ID method: ${message.method}`)
    }

    await this.hideIframe()
    return res
  }

  _listAccounts(): Promise<{ result: DIDLinksList }> {
    // TODO ask user for permission in future
    const accounts = this.getDIDLinksList()
    return Promise.resolve({ result: accounts })
  }

  async _createAccount(
    message: RPCRequest<'3id_createAccount', { accountId: string }>
  ): Promise<{ result: true }> {
    assert.isDefined(message.params, 'Message parameters must be provided')
    const accountId = message.params.accountId
    await this.userPermissionRequest3id({ type: 'create' })
    // TODO throw if account already exist

    const authSecret = await this.authCreate(accountId)
    await this.initIdentity(authSecret, accountId)
    await this.tryCreateLink(accountId)

    return { result: true }
  }

  // TODO change name
  async _addAuthAndLink(
    message: RPCRequest<'3id_addAuthAndLink', { accountId: string; baseDid: string }>
  ): Promise<{ result: true }> {
    assert.isDefined(message.params, 'Message parameters must be provided')
    const accountId = message.params.accountId
    const baseDid = message.params.baseDid

    const req: UserLinkRequest = {
      type: 'link',
      baseDid,
      accountId,
    }
    await this.userPermissionRequest3id(req)

    const authSecret = this.getStoredAccountByDid(baseDid)
    const authSecretAdd = await this.authCreate(accountId)
    await this.initIdentity(authSecret, accountId)
    await this.tryCreateLink(accountId)
    await this.addAuth(accountId, authSecretAdd)

    return { result: true }
  }

  async _didAuthReq(
    message: RPCRequest<string, { paths?: Array<string> }>,
    domain?: string | null
  ): Promise<RPCResponse | RPCErrorObject | null | void> {
    assert.isDefined(this.errorCb, 'Error callback must be defined')
    assert.isDefined(message.params, 'Message parameters must be defined')

    try {
      const accountId = (message.params as { accountId: string }).accountId
      if (this.activeAccount !== accountId) {
        await this.init(accountId, message, domain)
      }
      assert.isDefined(this.provider, 'DID provider must be defined')
      const res = await this.provider.send(message, domain)
      await this.hideIframe()
      return res
    } catch (e) {
      if ((e as Error).toString().includes('authorized')) {
        await this.hideIframe()
        return rpcError(message.id!)
      }
      this.errorCb(e, 'Error: Unable to connect')
    }
  }

  async _relayDidReq(message: RPCRequest, domain?: string | null): Promise<RPCResponse | null> {
    assert.isDefined(this.provider, 'DID provider must be defined')
    return await this.provider.send(message, domain)
  }

  /**
   *  Looks up if accountId is linked to did
   */
  async _resolveLink(accountId: string): Promise<LinkProof | undefined> {
    assert.isDefined(this.ceramic, 'Ceramic instance must be defined')

    const doc = await this.ceramic.createDocument(
      'caip10-link',
      { metadata: { controllers: [accountId] } },
      { anchor: false, publish: false }
    )
    const linkDoc = await this.ceramic.loadDocument(doc.id)
    return linkDoc.content as LinkProof | undefined
  }

  storeAccount(accountId: string, authSecretHex: string): void {
    const accounts = this.getStoredAccounts()
    accounts[accountId] = authSecretHex
    store.set(ACCOUNT_KEY, accounts)
  }

  // TODO any storage state should handle multiple windows, could cause problems here
  setActiveAccount(accountId: string): void {
    this.activeAccount = accountId
    store.set(ACTIVE_ACCOUNT_KEY, accountId)
  }

  getActiveAccount(): string | undefined {
    return store.get(ACTIVE_ACCOUNT_KEY) as string
  }

  getStoredAccount(accountId: string): Uint8Array | null {
    const accounts = this.getStoredAccounts()
    return accounts[accountId] ? Uint8Array.from(Buffer.from(accounts[accountId], 'hex')) : null
  }

  getStoredAccounts(): Record<string, string> {
    return (store.get(ACCOUNT_KEY) as Record<string, string> | undefined) || {}
  }

  getStoredAccountByDid(did: string): Uint8Array {
    const links = this.getDIDLinks(did) || []
    const accounts = this.getStoredAccounts()
    const accountId = links.find((e) => Boolean(accounts[e]))
    assert.isString(accountId, 'Account does not exist')
    return Uint8Array.from(Buffer.from(accounts[accountId], 'hex'))
  }

  getStoredAccountList(): Array<string> | null {
    const val = store.get(ACCOUNT_KEY) as Record<string, string> | undefined
    return val ? Object.keys(val) : null
  }

  storeDIDLinks(did: string, linkArray: Array<string> = []): void {
    const dids = this.getDIDLinksList()
    const didsArr = dids[did] || []
    const arr = didsArr.concat(linkArray.filter((i) => didsArr.indexOf(i) < 0))
    dids[did] = arr
    store.set(LINK_KEY, dids)
  }

  getDIDLinks(did: string): AccountsList | undefined {
    const dids = this.getDIDLinksList()
    return dids[did]
  }

  getDIDLinksList(): DIDLinksList {
    return (store.get(LINK_KEY) as DIDLinksList | undefined) || {}
  }

  getDIDs(): Array<string> | null {
    const val = store.get(LINK_KEY) as DIDLinksList | undefined
    return val ? Object.keys(val) : null
  }

  _createUserRequest(
    req: RPCRequest<string, { paths?: Array<string> }>,
    origin?: string | null
  ): UserAuthenticateRequest | null {
    assert.isDefined(req.params, 'Request parameters must be provided')

    if (this.threeId) {
      const has = req.params.paths ? this.threeId.permissions.has(origin, req.params.paths) : true
      if (has) return null
    }

    return {
      type: 'authenticate',
      origin,
      paths: req.params.paths || [],
    }
  }
}

export default ConnectService
