// This is a file generated by the deploy-model.mjs script, do not edit manually

import type { CryptoAccountLinks } from '@datamodels/identity-accounts-crypto'
import type { AlsoKnownAs } from '@datamodels/identity-accounts-web'
import type { BasicProfile } from '@datamodels/identity-profile-basic'
import type { ThreeIdKeychain } from '@datamodels/3id-keychain'
import type { ModelAliases, ModelTypeAliases } from '@glazed/types'

export type ModelTypes = ModelTypeAliases<
  {
    AlsoKnownAs: AlsoKnownAs
    BasicProfile: BasicProfile
    CryptoAccounts: CryptoAccountLinks
    ThreeIdKeychain: ThreeIdKeychain
  },
  {
    alsoKnownAs: 'AlsoKnownAs'
    basicProfile: 'BasicProfile'
    cryptoAccounts: 'CryptoAccounts'
    threeIdKeychain: 'ThreeIdKeychain'
  }
>

export const aliases: ModelAliases<ModelTypes> = {
  definitions: {
    threeIdKeychain: 'kjzl6cwe1jw14a50gupo0d433e9ojgmj9rd9ejxkc8vq6lw0fznsoohwzmejqs8',
    cryptoAccounts: 'kjzl6cwe1jw149z4rvwzi56mjjukafta30kojzktd9dsrgqdgz4wlnceu59f95f',
    alsoKnownAs: 'kjzl6cwe1jw146zfmqa10a5x1vry6au3t362p44uttz4l0k4hi88o41zplhmxnf',
    basicProfile: 'kjzl6cwe1jw145cjbeko9kil8g9bxszjhyde21ob8epxuxkaon1izyqsu8wgcic',
  },
  schemas: {
    ThreeIdKeychain: 'ceramic://k3y52l7qbv1frxiodfo6f25wocb8zz60ywqw4sqcprs26qx1qx467l4ybxplybvgg',
    CryptoAccounts: 'ceramic://k3y52l7qbv1frypussjburqg4fykyyycfu0p9znc75lv2t5cg4xaslhagkd7h7mkg',
    AlsoKnownAs: 'ceramic://k3y52l7qbv1fryojt8n8cw2k04p9wp67ly59iwqs65dejso566fij5wsdrb871yio',
    BasicProfile: 'ceramic://k3y52l7qbv1frxt706gqfzmq6cbqdkptzk8uudaryhlkf6ly9vx21hqu4r6k1jqio',
  },
  tiles: {},
}
