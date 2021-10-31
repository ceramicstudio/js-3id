import styles from './PrimaryButton.module.scss'

type ButtonProps = {
  label: string
  loading?: boolean
  onClick: (this: any, e: any) => void
}

export default function PrimaryButton(props: ButtonProps) {
  return (
    <div className={styles.btn} onClick={props.onClick}>
      {props.label}
    </div>
  )
}