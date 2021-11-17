import styles from './ModalFooter.module.scss'
  
export default function ModalFooter() {
  return(
    <div className={styles.footer}>
      <div className={styles.poweredBy}>
        Powered by <a href='http://ceramic.network' rel="noopener noreferrer" target="_blank"> Ceramic </a>
      </div>
    </div>
  )
}
  