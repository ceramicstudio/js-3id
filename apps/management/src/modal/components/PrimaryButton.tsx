import styles from './PrimaryButton.module.scss'
import type { ButtonProps } from '../../types'

// TODO button 
// disabled={isLoading === true ? true : false}

export default function PrimaryButton(props: ButtonProps) {
  return (
    <div className={styles.btn} onClick={props.onClick} >
      {props.status === 'pending' ? 'Loading' : props.label} 
      {props.status === 'pending' ? <div className={styles.loader}></div> : ''} 
    </div>
  )
}