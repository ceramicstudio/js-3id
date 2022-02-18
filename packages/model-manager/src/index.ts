import type { CeramicApi } from '@ceramicnetwork/common'
import { model as keychainModel } from '@datamodels/3id-keychain'
import { model as cryptoAccountsModel } from '@datamodels/identity-accounts-crypto'
import { model as webAccountsModel } from '@datamodels/identity-accounts-web'
import { model as profileModel } from '@datamodels/identity-profile-basic'
import { ModelManager } from '@glazed/devtools'

export const createModelManager = (ceramic: CeramicApi): ModelManager => {
  const manager = new ModelManager({ ceramic })
  manager.addJSONModel(keychainModel)
  manager.addJSONModel(cryptoAccountsModel)
  manager.addJSONModel(webAccountsModel)
  manager.addJSONModel(profileModel)
  return manager
}
