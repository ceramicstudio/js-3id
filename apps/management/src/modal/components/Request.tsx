import { reqStateAtom, serviceStateAtom } from '../state'
import { useAtom } from 'jotai'
import type { RequestState } from '../../types'
import type { UIMethodName  } from '@3id/ui-provider'
import { didShorten, urlToHost } from '../../utils'
import styles from './Request.module.scss'

const migrationInfoLink = "https://developers.ceramic.network/authentication/legacy/3id-connect-migration"

const requestPrompt: { [K in UIMethodName]: (request: RequestState<K>) => JSX.Element } = {
    'prompt_authenticate': (request) => {
        return (
            <>
              <div>
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
            <span className={styles.origin} >{urlToHost(document.referrer)}</span> is requesting permission
            to interact with your decentralized ID. Connect your wallet.
          </div>
        </>
      )
    },
    'prompt_migration': (request) => {
      return (
        <>
          <div>
            Your 3Box DID <code>{didShorten(request.params?.legacyDid)}</code> will be migrated.
          </div>
        </>
      )
    },
    'prompt_migration_fail': (request) => {
      return (
        <>
          <div>
            You have a 3Box account we are unable to migrate, continue with a new account?
            <br />
            <br />
            <a href={migrationInfoLink} rel="noopener noreferrer" target="_blank">
              Learn More
            </a>
          </div>
        </>
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
          An error has occurred while authenticating, unable to connect
        </div>
      )
    },
    'inform_close': (request) => (<></>)
} 

export default function Request() {
  const [reqState, ] = useAtom(reqStateAtom)

  return(
    <div >
      { reqState?.type ? 
        // @ts-ignore
        requestPrompt[reqState.type](reqState) 
      : 
        (<div>Detecting Request Type...</div>)
      }
    </div>
  )
 }