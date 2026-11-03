import styles from './Topbar.module.css'

export default function Topbar() {
  return (
    <header className={styles.topbar}>
      <p className={styles.titulo}>
        KL CLUB <span>Gestão</span>
      </p>
    </header>
  )
}
