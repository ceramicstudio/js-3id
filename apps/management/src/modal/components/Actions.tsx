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
  const [reqState, ] = useAtom(reqStateAtom)

  if (!reqState) return (<></>)

  if (reqState?.type === 'prompt_migration') {
		return(
			<div className={styles.actions}>
				<PrimaryButton label="Continue" onClick={()=>resTrue(reqState)}/>
				<SecondaryButton label="How it works?" href={migrationLink}/>
			</div>
		)
  } else if (reqState?.type === 'prompt_migration_fail' || reqState?.type === 'prompt_migration_skip') {
		return(
			<div className={styles.actions}>
				<PrimaryButton label="Continue" onClick={()=>resTrue(reqState)}/>
				<SecondaryButton label="Learn More" href={migrationFailLink}/>
			</div>
		)
	} else if (reqState?.type === 'prompt_authenticate') {
		return(
			<div className={styles.actions}>
				<PrimaryButton label="Continue" onClick={()=>resTrue(reqState)}/>
				<br/>
			</div>
		)
	} else if (reqState?.type === 'prompt_account') {
		return(
			<div className={styles.actions}>
				<PrimaryButton label="Connect to existing ID" onClick={()=>resTrue(reqState)}/>
				<SecondaryButton label="Create a new ID" onClick={()=>resFalse(reqState)}/>
			</div>
		)
	} else {
		return (<></>)
	}
}



