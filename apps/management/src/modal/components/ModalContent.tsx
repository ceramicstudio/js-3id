import styles from './ModalContent.module.scss'
import Permissions from './Permissions'
import PrimaryButton from './PrimaryButton'
import { reqStateAtom, resStatusAtom} from '../state'
import { useAtom } from 'jotai'

export default function ModalContent() {
  const [responseStatus, setResponseStatus] = useAtom(resStatusAtom)
  const [requestState, setRequestState] = useAtom(reqStateAtom)  
  return(
    <div className={styles.body}>
      <div className={styles.inner}>
        A request
        {requestState?.method}
        <Permissions/>
        <div className={styles.bottom}>
          <PrimaryButton label="Accept" onClick={()=>responseStatus?.promise.resolve(true)}/>
        </div>
      </div>
    </div>
  )
 }