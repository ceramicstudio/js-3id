import styles from './HeaderContainer.module.scss'
import Avatar from 'boring-avatars'
import { useDIDBasicProfile } from '../hooks'
import { useEffect } from 'react'
import close from '../../../assets/close.svg'
import { reqStateAtom, serviceStateAtom } from '../state'
import { useAtom } from 'jotai'
import { didShorten, ipfsToImg, formatCAIP10, urlToIcon } from '../../utils'
import type { BasicProfile } from '@datamodels/identity-profile-basic'
import { RequestState } from '../../types'

const headerData = (req: RequestState) => {
  if (!req) {
    return(
      <div className={styles.details}></div>
    )
  }

  let headerStr
  if (req.type === 'prompt_authenticate') {
    // @ts-ignore
    headerStr = didShorten(req.params.did)
  } else if (req.type === 'prompt_migration') {
     // @ts-ignore
    headerStr = didShorten(req.params.legacyDid)
  } else if (req.type === 'prompt_account' || req.type === 'prompt_migration_fail' || req.type === 'prompt_migration_skip') {
     // @ts-ignore
    headerStr = formatCAIP10(req.params.caip10)
  }

  if (headerStr !== undefined) {
    return (
      <div className={`${styles.details} ${styles.dark}`}>
        <code>{headerStr}</code>
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
      {urlToIcon(document.referrer)}
    </div>
    <div className={styles.avatar}>
      {
        // @ts-ignore
        boringOrAvatar(basicProfile || undefined, reqState?.params.did  )
      }
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
        {reqState ? headerData(reqState) : null}
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
  