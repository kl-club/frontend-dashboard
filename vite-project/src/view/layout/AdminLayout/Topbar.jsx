import Icone from '../../components/Icone/Icone.jsx'
import styles from './Topbar.module.css'

export default function Topbar({ loja }) {
  const nome = loja?.nome ?? 'Loja Principal'
  const aberta = loja?.aberta ?? true
  return (
    <header className={styles.topbar}>
      <p className={styles.titulo}>
        KL CLUB <span>Gestão</span>
      </p>
      <span className={`${styles.loja} ${aberta ? styles.aberta : styles.fechada}`}>
        <Icone nome="loja" tamanho={16} />
        {nome} ({aberta ? 'Aberta' : 'Fechada'})
      </span>
    </header>
  )
}
