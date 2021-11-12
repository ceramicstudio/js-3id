import styles from './PrimaryButton.module.scss'

type ButtonProps = {
  label: string
  loading?: boolean
  onClick: (this: any, e: any) => void
}

// TODO add button loading state 
// <button
// disabled={isLoading === true ? true : false}
// className={`btn ${localStore.class || 'primary'}`}
// onClick={() => {
//   store.set({
//     loading: true,
//   })
//   setLoading(true)
//   {
//     localStore.click ? localStore.click() : btnFunction()
//   }
//   // btnFunction()
// }}>
// {isLoading === true ? <div className="loader"></div> : ''} {body}
// </button>

export default function PrimaryButton(props: ButtonProps) {
  return (
    <div className={styles.btn} onClick={props.onClick}>
      {props.label}
    </div>
  )
}