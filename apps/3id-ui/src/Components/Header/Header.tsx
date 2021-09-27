import React from 'react'
import Avatar from 'boring-avatars'
import KeyDidResolver from 'key-did-resolver'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { DID } from 'dids'

import { createIdx, createCeramic } from '../../utils'
import './Header.scss'
import { ResolverRegistry } from 'did-resolver'

type HeaderProps = {
  did?: string
}
const Header = ({ did }: HeaderProps) => {
  let idx: any
  const authenticate = async () => {
    const ceramic = await createCeramic()
    const keyDidResolver = KeyDidResolver.getResolver()
    const threeIdResolver = ThreeIdResolver.getResolver(ceramic)

    const resolverRegistry: ResolverRegistry = {
      ...threeIdResolver,
      ...keyDidResolver,
    }
    const did = new DID({
      resolver: resolverRegistry,
    })
    await did.authenticate()
    await ceramic.setDID(did)
    const idx = createIdx(ceramic)
    return idx
  }

  const setIDX = async () => {
    idx = await authenticate()
  }

  React.useEffect(() => {
    if (did) {
      setIDX()
      if (idx) {
        idx.get('basicProfile')
      }
    }
  }, [did])
  return (
    <div className="head">
      <div className="logo-container">
        <a
          href="https://ceramic.network"
          rel="noopener noreferrer"
          target="_blank"
          className="logo col-12">
          SelfId Connect
        </a>
        <span> SelfID Connect </span>
      </div>
      <div className="image-container">
        <div className="avatar">
          <Avatar
            size={65}
            name={did ?? 'self.id-connect'}
            variant="marble"
            colors={['#FF0092', '#FFCA1B', '#B6FF00', '#228DFF', '#BA01FF']}
          />
        </div>
      </div>
    </div>
  )
}

export default Header
