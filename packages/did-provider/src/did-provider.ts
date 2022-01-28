import { decodeCleartext } from 'dag-jose-utils'
import { createJWS, decryptJWE } from 'did-jwt'
import type {
  AuthParams,
  CreateJWSParams,
  DecryptJWEParams,
  DIDMethodName,
  DIDProvider,
  DIDProviderMethods,
  GeneralJWS,
} from 'dids'
import { HandlerMethods, RPCError, createHandler } from 'rpc-utils'
import type { RPCRequest, RPCResponse } from 'rpc-utils'

import { Keyring } from './keyring.js'
import { Permissions } from './permissions.js'
import type { ThreeIDX } from './three-idx.js'
import { toStableObject, encodeBase64, parseJWEKids } from './utils.js'

type Origin = string | null | undefined

export type Context = {
  permissions: Permissions
  threeIdx: ThreeIDX
  keyring: Keyring
  origin: Origin
  forcedDID?: string
}

function toGeneralJWS(jws: string): GeneralJWS {
  const [protectedHeader, payload, signature] = jws.split('.')
  return {
    payload,
    signatures: [{ protected: protectedHeader, signature }],
  }
}

async function sign(
  payload: Record<string, any> | string,
  didWithFragment: string,
  keyring: Keyring,
  threeIdx: ThreeIDX,
  protectedHeader: Record<string, any> = {},
  revocable?: boolean
): Promise<GeneralJWS> {
  let [did, keyFragment] = didWithFragment.split('#') // eslint-disable-line prefer-const
  let kid, signer
  if (did.startsWith('did:key:')) {
    const pubkey = did.split(':')[2]
    kid = `${did}#${pubkey}`
    signer = keyring.getMgmtSigner(pubkey)
  } else {
    if (did !== threeIdx.id) throw new Error(`Unknown DID: ${did}`)
    const version = threeIdx.get3idVersion()
    if (!keyFragment) keyFragment = keyring.getKeyFragment(version)
    kid = `${did}${revocable ? '' : `?version-id=${version}`}#${keyFragment}`
    signer = keyring.getSigner(version)
  }
  const header = toStableObject(Object.assign(protectedHeader, { kid }))
  const jws = await createJWS(
    typeof payload === 'string' ? payload : toStableObject(payload),
    signer,
    header
  )
  return toGeneralJWS(jws)
}

export const didMethods: HandlerMethods<Context, DIDProviderMethods> = {
  did_authenticate: async (
    { permissions, keyring, threeIdx, origin, forcedDID },
    params: AuthParams
  ) => {
    const paths = await permissions.request(origin, params.paths || [])
    // paths should be an array if permission granted
    // may be a subset or requested paths or empty array
    if (paths === null) throw new RPCError(4001, 'User Rejected Request')
    return sign(
      {
        did: forcedDID || threeIdx.id,
        aud: params.aud,
        nonce: params.nonce,
        paths,
        exp: Math.floor(Date.now() / 1000) + 600, // expires 10 min from now
      },
      forcedDID || threeIdx.id,
      keyring,
      threeIdx
    )
  },
  did_createJWS: async (
    { permissions, keyring, threeIdx, origin },
    params: CreateJWSParams & { did: string; revocable?: boolean }
  ) => {
    if (!permissions.has(origin)) throw new RPCError(4100, 'Unauthorized')
    // TODO - if the requesting DID is our management key
    const payload = params.payload as Record<string, any>
    // (did:key) we should request explicit permission.
    const jws = await sign(
      payload,
      params.did,
      keyring,
      threeIdx,
      params.protected,
      params.revocable
    )
    return { jws }
  },
  did_decryptJWE: async ({ permissions, keyring, origin }, params: DecryptJWEParams) => {
    if (!permissions.has(origin)) throw new RPCError(4100, 'Unauthorized')
    const parsedKids = parseJWEKids(params.jwe)
    const decrypter = keyring.getAsymDecrypter(parsedKids)
    const bytes = await decryptJWE(params.jwe, decrypter)
    let obj
    try {
      obj = decodeCleartext(bytes)
    } catch (e) {
      // There was an error decoding, which means that this is not a cleartext encoded as a CID
      // TODO - We should explicitly ask for permission.
    }
    const paths = obj?.paths as Array<string> | undefined
    if (obj && !permissions.has(origin, paths)) throw new RPCError(4100, 'Unauthorized')
    return { cleartext: encodeBase64(bytes) }
  },
}

export interface ProviderConfig {
  permissions: Permissions
  threeIdx: ThreeIDX
  keyring: Keyring
  forcedOrigin?: string
  forcedDID?: string
}

type HandleMethod = <Name extends DIDMethodName>(
  origin: string,
  msg: RPCRequest<DIDProviderMethods, Name>
) => Promise<RPCResponse<DIDProviderMethods, Name> | null>

export class DidProvider implements DIDProvider {
  _handle: HandleMethod

  constructor({ permissions, threeIdx, keyring, forcedOrigin, forcedDID }: ProviderConfig) {
    const handler = createHandler<Context, DIDProviderMethods>(didMethods)
    this._handle = async <Name extends DIDMethodName>(
      origin: string,
      msg: RPCRequest<DIDProviderMethods, Name>
    ): Promise<RPCResponse<DIDProviderMethods, Name> | null> => {
      return await handler(
        {
          origin: forcedOrigin ?? origin,
          permissions,
          threeIdx,
          keyring,
          forcedDID,
        },
        msg
      )
    }
  }

  get isDidProvider(): boolean {
    return true
  }

  async send<Name extends DIDMethodName>(
    msg: RPCRequest<DIDProviderMethods, Name>,
    origin?: Origin
  ): Promise<RPCResponse<DIDProviderMethods, Name> | null> {
    return await this._handle(origin ?? '', msg)
  }
}
