import { reqStateAtom } from '../state'
import { useAtom } from 'jotai'
import type { RequestState } from '../../types'
import styles from './Actions.module.scss'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'

const resTrue = (req: RequestState) => req.respond.resolve({result: true})
const resFalse = (req: RequestState) => req.respond.resolve({result: false})

const migrationLink = "https://developers.ceramic.network/authentication/legacy/3id-connect-migration"
const migrationFailLink = "https://developers.ceramic.network/authentication/3id-did/3box-migration/#migration-difficulties"

export default function Actions() {
  const [reqState, setReqState] = useAtom(reqStateAtom)

  if (!reqState) return (<></>)

  const clickTrue = () => {
    setReqState(Object.assign(reqState, {status: 'pending'}))
    resTrue(reqState)
  }

  if (reqState?.type === 'prompt_migration') {
		return(
			<div className={styles.actions}>
				<PrimaryButton label="Continue" onClick={clickTrue} status={reqState.status}/>
				<SecondaryButton label="How it works?" href={migrationLink} status={reqState.status}/>
			</div>
		)
  } else if (reqState?.type === 'prompt_migration_fail' || reqState?.type === 'prompt_migration_skip') {
		return(
			<div className={styles.actions}>
				<PrimaryButton label="Continue" onClick={clickTrue} status={reqState.status}/>
				<SecondaryButton label="Learn More" href={migrationFailLink} status={reqState.status}/>
			</div>
		)
	} else if (reqState?.type === 'prompt_authenticate') {
		return(
			<div className={styles.actions}>
				<PrimaryButton label='Continue' onClick={clickTrue} status={reqState.status}/>
				<br/>
			</div>
		)
	} else if (reqState?.type === 'prompt_account') {
		return(
			<div className={styles.actions}>
				<PrimaryButton label="Connect to existing ID" onClick={clickTrue} status={reqState.status}/>
				<SecondaryButton label="Create a new ID" onClick={()=>resFalse(reqState)} status={reqState.status}/>
			</div>
		)
	} else {
		return (<></>)
	}
}



