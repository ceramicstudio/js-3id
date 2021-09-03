import { didShorten } from '../utils'

type Data = {
  request: { legacyDid: string }
}
export const PromptMigration = (data: Data) =>
  `Your 3Box DID ${didShorten(data.request.legacyDid)} will be migrated.`

export default PromptMigration
