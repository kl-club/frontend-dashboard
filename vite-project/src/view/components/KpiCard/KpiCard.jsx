import Esqueleto from '../Esqueleto/Esqueleto.jsx'
import Icone from '../Icone/Icone.jsx'
import styles from './KpiCard.module.css'

/**
 * Cartão de KPI. `apoio` é a linha de baixo; quando ausente, é ocultada.
 * `tomApoio`: positivo | negativo | neutro.
 */
export default function KpiCard({ titulo, valor, apoio, tomApoio = 'neutro', icone, carregando = false }) {
  return (
    <article className={styles.cartao} aria-busy={carregando || undefined}>
      <header className={styles.topo}>
        <h3 className={styles.titulo}>{titulo}</h3>
        {icone && (
          <span className={styles.icone}>
            <Icone nome={icone} tamanho={18} />
          </span>
        )}
      </header>
      {carregando ? (
        <>
          <Esqueleto largura="60%" altura={28} />
          <Esqueleto largura="45%" altura={12} />
        </>
      ) : (
        <>
          <p className={`${styles.valor} tabular`}>{valor}</p>
          {apoio && <p className={`${styles.apoio} ${styles[tomApoio] ?? ''}`}>{apoio}</p>}
        </>
      )}
    </article>
  )
}
