import styles from './HeaderContainer.module.scss'
import Avatar from 'boring-avatars'
import { useDIDBasicProfile } from '../hooks'
import { useEffect } from 'react'


const boringOrAvatar = (
  <Avatar
    size={65}
    name={'self.id-connect'}
    variant="marble"
    colors={['#FF0092', '#FFCA1B', '#B6FF00', '#228DFF', '#BA01FF']}
  />
)
  
export default function HeaderContainer() {



  const [ basicProfile, loadBasicProfile ] = useDIDBasicProfile()
  useEffect(() => {
    void loadBasicProfile()
  }, [])

  return(
    <div className={styles.head}>
      <div className={styles['head-container']}>
        {/* {headerData()}
        {closeButton} */}
      </div>
      <div className={styles['logo-container']}>
        <a
          href="https://ceramic.network"
          rel="noopener noreferrer"
          target="_blank"
          className="logo col-12">
          {/* <img src={selfIdLogo} alt="self.id logo" /> */}
        </a>
      </div>
      <div className={styles['image-container']}>
        <div className={styles.avatar}>
          {boringOrAvatar}
        </div>
      </div>
    </div>
  )
}
  