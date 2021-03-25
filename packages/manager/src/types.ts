export type AccountsList = Array<string>
export type DIDLinksList = Record<string, AccountsList>

export type ExcludesBoolean = <T>(x: T | null) => x is T

export type AuthConfig = { authId: string; authSecret: Uint8Array }
export type SeedConfig = { v03ID: string; seed: Uint8Array }
