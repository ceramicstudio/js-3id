import { reqStateAtom, serviceStateAtom } from '../state'
import { useAtom } from 'jotai'
import type { RequestState } from '../../types'
import type { UIMethodName  } from '@3id/ui-provider'
import { didShorten, urlToHost, formatCAIP10 } from '../../utils'
import styles from './Request.module.scss'

const migrationInfoLink = "https://developers.ceramic.network/authentication/legacy/3id-connect-migration"

const requestPrompt: { [K in UIMethodName]: (request: RequestState<K>) => JSX.Element } = {
    'prompt_authenticate': (request) => {
        return (
            <>
              <div>
                <br />
                <span className={styles.origin}>
                  {urlToHost(document.referrer)}
                </span>{' '}
                is requesting permission to connect to your decentralized identity.
              </div>
            </>
          )
    }, 
    'prompt_account': (request) => {
      return (
        <>
          <div>
            <br />
            <span className={styles.origin} >{urlToHost(document.referrer)}</span> uses Ceramic for data storage. 
            Your address  <span className={styles.origin} >{
              // @ts-ignore
              formatCAIP10(request.params.caip10)
            }</span> doesn't have a Ceramic account. To get started, create a new account or link your address to an existing account. 
          </div>
        </>
      )
    },
    'prompt_migration': (request) => {
      return (
        <div>
          Your 3Box DID <span className={styles.origin} >{didShorten(request.params?.legacyDid)}</span> will be migrated.
        </div>
      )
    },
    'prompt_migration_fail': (request) => {
      return (
        <div>
          You have a 3Box account we are unable to migrate, continue with a new account?
        </div>
      )
    },
    'prompt_migration_skip': (request) => {
      return (
        <div>
          Your 3Box DID could not be migrated, continue with a new account? 
        </div>
      )
    },
    'inform_error': (request) => {
      return (
        <div>
          Oops, looks like there was a problem signing in. Close window and try again.
        </div>
      )
    },
    'inform_close': (request) => (<></>)
} 

export default function Request() {
  const [reqState, ] = useAtom(reqStateAtom)

  return(
    <div className={styles.textWrap}>
      { reqState?.type ? 
        // @ts-ignore
        requestPrompt[reqState.type](reqState) 
      : 
        (<div>Detecting Request Type...</div>)
      }
    </div>
  )
 }