import styles from './SecondaryButton.module.scss'
import type { ButtonProps } from '../../types'

export default function SecondaryButton(props: ButtonProps) {
  const button = (
    <button className={styles.btn} onClick={props.onClick} disabled={ props.status === 'pending' ? true : false}>
      {props.status === 'pending' ? props.loadingLabel || 'Loading' : props.label} 
      {props.status === 'pending' ? <div className={styles.loader}></div> : ''} 
    </button>
  )

  if (props.href) {
    return ( 
      <a href={props.href} rel="noopener noreferrer" target="_blank" className={styles.linkWrap}>
        {button}
      </a>
    )
  }

  return button
}