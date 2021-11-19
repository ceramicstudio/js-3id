import styles from './ModalContent.module.scss'
import Permissions from './Permissions'
import PrimaryButton from './PrimaryButton'
import Request from './Request'
import Actions from './Actions'
import { reqStateAtom, serviceStateAtom } from '../state'
import { useAtom } from 'jotai'
import { testUIReq } from '../uiProvider'
import { useCallback } from 'react'

export default function ModalContent() {
  const [reqState, ] = useAtom(reqStateAtom)
  const [serviceState, ] = useAtom(serviceStateAtom)

  return(
    <div className={styles.body}>
      <div className={styles.inner}>
        <Request/>
        <Actions/>
      </div>
    </div>
  )
 }