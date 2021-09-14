/**
 * TODO: Export these types to standalone package.
 */
export type RenderTypes = undefined | 'account' | 'migration' | 'authenticate' | 'migration_fail'

export type UserAuthenticateRequest = {
  type: 'authenticate'
  paths: Array<string>
  origin?: string | null
  did?: string
}

export type UserRequestCancel = (callback?: () => void) => void
