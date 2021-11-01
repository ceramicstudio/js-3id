import styles from './ModalContent.module.scss'
import Permissions from './Permissions'
import PrimaryButton from './PrimaryButton'
import { reqStateAtom } from '../state'
import { useAtom } from 'jotai'

export default function ModalContent() {
  const [reqState, ] = useAtom(reqStateAtom)
  return(
    <div className={styles.body}>
      <div className={styles.inner}>
        A request
        {reqState?.type}
        <Permissions/>
        <div className={styles.bottom}>
          <PrimaryButton label="Accept" onClick={()=>reqState?.respond.resolve(true)}/>
        </div>
      </div>
    </div>
  )
 }