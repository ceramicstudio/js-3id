import styles from './HeaderContainer.module.scss'
import Avatar from 'boring-avatars'
import { useDIDBasicProfile } from '../hooks'
import { useEffect } from 'react'
import close from '../../../assets/close.svg'
import { reqStateAtom, serviceStateAtom } from '../state'
import { useAtom } from 'jotai'
import { didShorten, ipfsToImg } from '../../utils'
import type { BasicProfile } from '@datamodels/identity-profile-basic'

// TODO
// can show legacy did for migration 
// can who CAIP10 for account request
const headerData = (did?: string) => {
  if (did !== undefined) {
    return (
      <div className={`${styles.details} ${styles.dark}`}>
        <code>{didShorten(`${did}`)}</code>
      </div>
    )
  } 
  return(
    <div className={styles.details}></div>
  )
}

const boringOrAvatar = (basicProfile?: BasicProfile, did?: string) =>  {
    return basicProfile?.image ? (
    <div
      className="avatarImage"
      style={{
        backgroundImage: ipfsToImg(basicProfile?.image.original.src),
      }}></div>
  ) : (
    <Avatar
      size={75}
      name={did || 'self.id-connect'}
      variant="marble"
      colors={['#FF0092', '#FFCA1B', '#B6FF00', '#228DFF', '#BA01FF']}
    />
  )
}
  
export default function HeaderContainer() {
  const [ basicProfile, loadBasicProfile ] = useDIDBasicProfile()
  const [reqState, ] = useAtom(reqStateAtom)

  useEffect(() => {
    void loadBasicProfile()
  }, [])

  const imageHeaders  =
  reqState?.type === 'prompt_authenticate' || reqState?.type === 'prompt_account'  ? (
    <div className={styles['image-container']}>
    <div
      className={styles.appIcon}
    >
      {/* TODO */}
      L
    </div>
    <div className={styles.avatar}>
      {boringOrAvatar(basicProfile || undefined, reqState?.params.did )}
    </div>
  </div>
  ) : (
   <></>
  )

  const headerStyle = 
    reqState?.type === 'prompt_authenticate' || reqState?.type === 'prompt_account'  ? {
      height: 131 
    } : { }


  // TODO migration, error headers, types
  return (
    <div className={styles.head} style={headerStyle}>
      <div className={styles['head-container']}>
        {headerData(reqState?.params.did || reqState?.params.legacyDid)}
        <div
          className={styles['close-btn']}
          onClick={() => {
            reqState?.respond.resolve({error: 'cancellation'})
        }}>
          <img src={close} />
        </div>
      </div>
      {imageHeaders}
    </div>
  )
}
  