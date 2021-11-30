import styles from './Permissions.module.scss'

// statisc change content for each
const permissions = ['Store data', 'Read data']

export default function Permissions() {
  return (
    <div className={styles.permissions}>
      {permissions.map((permission, _id) => {
        return (
          <div className={styles.permission} key={_id}>
            <span className={styles['permission-note']} />
            {permission}
          </div>
        )
      })}
    </div>
  )
}
