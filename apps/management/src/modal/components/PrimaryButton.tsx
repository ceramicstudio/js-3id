import styles from './PrimaryButton.module.scss'
import type { ButtonProps } from '../../types'

// TODO button 
// disabled={isLoading === true ? true : false}

export default function PrimaryButton(props: ButtonProps) {
  return (
    <button className={styles.btn} onClick={props.onClick} disabled={ props.status === 'pending' ? true : false}>
      {props.status === 'pending' ? props.loadingLabel || 'Loading' : props.label} 
      {props.status === 'pending' ? <div className={styles.loader}></div> : ''} 
    </button>
  )
}