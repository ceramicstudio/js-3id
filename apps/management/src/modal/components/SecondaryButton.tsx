import styles from './SecondaryButton.module.scss'

// TODO MOVE 
type ButtonProps = {
  label: string
  loading?: boolean
  onClick: (this: any, e: any) => void
}

export default function SecondaryButton(props: ButtonProps) {
  return (
    <div className={styles.btn} onClick={props.onClick}>
      {props.label}
    </div>
  )
}