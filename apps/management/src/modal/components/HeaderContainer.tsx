import styles from './HeaderContainer.module.scss'
import Avatar from 'boring-avatars'
import { useDIDBasicProfile } from '../hooks'
import { useEffect } from 'react'
import close from '../../../assets/close.svg'
import { reqStateAtom, serviceStateAtom } from '../state'
import { useAtom } from 'jotai'

// TODO cleanup
const headerData = (type:string, did: string) => {
  if (type === 'migration_skip') {
    return (
      <div className={styles.details}>
        <a href="https://ceramic.network" rel="noopener noreferrer" target="_blank">
          What is this?
        </a>
      </div>
    )
  } else if (type === 'migration') {
    return (
      <div className={styles.details}>
        <a
          href="https://developers.ceramic.network/authentication/legacy/3id-connect-migration"
          rel="noopener noreferrer"
          target="_blank">
          How migration works?
        </a>
      </div>
    )
  } else if (did !== undefined) {
    return (
      <div className={styles.details}>
        {/* <code>{didShorten(`${did}`)}</code> */}
        <code>{did}</code>
      </div>
    )
  } else {
    return (
      <div className={styles.details}>
        Powered by{' '}
        <a href="https://self.id" rel="noopener noreferrer" target="_blank">
          Self.id
        </a>
      </div>
    )
  }
}

const boringOrAvatar = (
  <Avatar
    size={65}
    name={'self.id-connect'}
    variant="marble"
    colors={['#FF0092', '#FFCA1B', '#B6FF00', '#228DFF', '#BA01FF']}
  />
)

const randomColor = Math.floor(Math.random() * 16777215).toString(16)

// const boringOrAvatar = userData?.image ? (
//   <div
//     className="avatarImage"
//     style={{
//       backgroundImage: ipfsToImg(userData.image.original.src),
//     }}></div>
// ) : (
//   <Avatar
//     size={65}
//     name={did || 'self.id-connect'}
//     variant="marble"
//     colors={['#FF0092', '#FFCA1B', '#B6FF00', '#228DFF', '#BA01FF']}
//   />
// )
  
export default function HeaderContainer() {
  const [ basicProfile, loadBasicProfile ] = useDIDBasicProfile()
  const [reqState, ] = useAtom(reqStateAtom)

  useEffect(() => {
    void loadBasicProfile()
  }, [])

  // get request states as well
  return (
    <div className={styles.head}>
      <div className={styles['head-container']}>
        {headerData('auth_req', 'mydidsd')}
        <div
          className={styles['close-btn']}
          onClick={() => {
            reqState?.respond.resolve({error: 'cancellation'})
        }}>
          <img src={close} />
        </div>
      </div>
      <div className={styles['image-container']}>
        <div
          className={styles.appIcon}
          style={{
            backgroundColor: randomColor,
          }}>
          L
        </div>
        <div className={styles.avatar}>
          {boringOrAvatar}
        </div>
      </div>
    </div>
  )
}
  