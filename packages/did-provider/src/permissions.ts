import store from 'store'

interface PermissionRequest {
  type: string
  origin?: string | null
  payload: Record<string, any>
}

type Origin = string | null | undefined
export type GetPermissionFn = (req: PermissionRequest) => Promise<Array<string>> | null

export const SELF_ORIGIN = '__IDW_ORIGIN'

const storageKey = (origin: Origin, did: string) => {
  if (!origin) origin = '__NULL_ORIGIN'
  return `3id_permission_${did}_${origin}`
}

export class Permissions {
  did: string | null = null

  /**
   * The Permissions class exposes methods to read and update the given permissions
   */
  constructor(protected getPermission: GetPermissionFn) {
    if (typeof this.getPermission !== 'function') {
      throw new Error('getPermission parameter has to be a function')
    }
  }

  /**
   * Request permission for given paths for a given origin.
   *
   * @param     {String}            origin          Application domain
   * @param     {Array<String>}     paths           The desired paths
   * @return    {Array<String>}                     The paths that where granted permission for
   */
  async request(origin: Origin, paths: Array<string> = []): Promise<Array<string> | null> {
    if (this.has(origin, paths)) {
      return paths
    } else {
      const given = await this.getPermission({
        type: 'authenticate',
        origin,
        payload: { paths },
      })
      const existing = this.get(origin)
      const union = existing
        ? existing.concat(given ? given.filter((e) => !existing.includes(e)) : [])
        : given
      this.set(origin, union)
      return given
    }
  }

  /**
   * Determine if permission has been given for paths for a given origin.
   *
   * @param     {String}            origin          Application domain
   * @param     {Array<String>}     paths           The desired paths
   * @return    {Boolean}                           True if permission has previously been given
   */
  has(origin: Origin, paths: Array<string> = []): boolean {
    if (origin === SELF_ORIGIN) return true
    const currentPaths = this.get(origin)
    return paths.reduce((acc: boolean, path: string) => {
      return acc && Boolean(currentPaths?.includes(path))
    }, Boolean(currentPaths))
  }

  /**
   * Get the paths which the given origin has permission for.
   *
   * @param     {String}            origin          Application domain
   * @return    {Array<String>}                     The permissioned paths
   */
  get(origin: Origin): Array<string> | null {
    if (!this.did) throw new Error('DID not set')
    return store.get(storageKey(origin, this.did)) as Array<string> | null
  }

  /**
   * Set the paths which the given origin should have permission for.
   *
   * @param     {String}            origin          Application domain
   * @param     {Array<String>}     paths           The desired paths
   */
  set(origin: Origin, paths: Array<string> | null): void {
    if (!this.did) throw new Error('DID not set')
    store.set(storageKey(origin, this.did), paths)
  }
}
