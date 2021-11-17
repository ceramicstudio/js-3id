import styles from './SecondaryButton.module.scss'
import type { ButtonProps } from '../../types'

export default function SecondaryButton(props: ButtonProps) {

  const button = (
    <div className={styles.btn} onClick={props.onClick}>
      {props.label}
    </div>
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