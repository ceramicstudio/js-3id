import { CeramicClient } from '@ceramicnetwork/http-client'
import { model as cryptoAccountsModel } from '@datamodels/identity-accounts-crypto'
import { model as webAccountsModel } from '@datamodels/identity-accounts-web'
import { model as profileModel } from '@datamodels/identity-profile-basic'
import { model as keychainModel } from '@datamodels/3id-keychain'
import { ModelManager } from '@glazed/devtools'

export const idxModelManager = (ceramic: CeramicClient): ModelManager => {
    const manager = new ModelManager(ceramic)
    manager.addJSONModel(cryptoAccountsModel)
    manager.addJSONModel(webAccountsModel)
    manager.addJSONModel(profileModel)
    manager.addJSONModel(keychainModel)
    return manager
}
  