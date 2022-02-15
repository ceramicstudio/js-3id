import { createModelManager } from '@3id/model-manager'
import { getResolver as get3IDResolver } from '@ceramicnetwork/3id-did-resolver'
import { DID } from 'dids'
import { getResolver as getKeyResolver } from 'key-did-resolver'
import CeramicEnvironment from 'jest-environment-ceramic'

export default class ThreeIDEnvironment extends CeramicEnvironment {
  async setup() {
    await super.setup()
    this.global.ceramic.did = new DID({
      resolver: { ...getKeyResolver(), ...get3IDResolver(this.global.ceramic) },
    })
    const manager = createModelManager(this.global.ceramic)
    this.global.modelAliases = await manager.deploy()
  }
}
