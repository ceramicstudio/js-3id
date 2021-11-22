import { reqStateAtom } from '../state'
import { useAtom } from 'jotai'
import type { RequestState } from '../../types'
import styles from './Actions.module.scss'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'

const migrationFailLink = "https://developers.ceramic.network/authentication/3id-did/3box-migration/#migration-difficulties"

export default function Actions() {
  const [reqState, setReqState] = useAtom(reqStateAtom)

  if (!reqState) return (<></>)

  const clickTrue = () => {
    setReqState(Object.assign({}, reqState, {status: 'pending'}))
    reqState.respond.resolve({result: true})
  }

  const clickFalse = () => {
    setReqState(Object.assign({}, reqState, {status: 'pending'}))
    reqState.respond.resolve({result: false})
  }

  if (reqState?.type === 'prompt_migration') {
		return(
			<div className={styles.actions}>
				<PrimaryButton label="Continue" onClick={clickTrue} status={reqState.status}/>
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
				<PrimaryButton label="Link existing account" onClick={clickFalse} status={reqState.status} loadingLabel="Sign messages in your wallet"/>
				<SecondaryButton label="Create new account" onClick={() => clickTrue(reqState)} status={reqState.status} loadingLabel=" "/>
			</div>
		)
	} else {
		return (<></>)
	}
}



