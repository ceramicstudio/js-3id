import { reqStateAtom } from '../state'
import { useAtom } from 'jotai'
import type { RequestState } from '../../types'
import styles from './Actions.module.scss'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'

const resTrue = (req: RequestState) => req.respond.resolve({result: true})
const resFalse = (req: RequestState) => req.respond.resolve({result: false})
const continueReq = ['prompt_authenticate', 'prompt_migration', 'prompt_migration_fail', 'prompt_migration_skip']

export default function Actions() {
  const [reqState, ] = useAtom(reqStateAtom)

	if (!reqState) return (<></>)
	
	if (continueReq.includes(reqState?.type)) {
		return(
			<div className={styles.actions}>
				<PrimaryButton label="Continue" onClick={()=>resTrue(reqState)}/>
				<SecondaryButton label="Cancel" onClick={()=>resFalse(reqState)}/>
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



