import Icone from '../Icone/Icone.jsx'
import styles from './Painel.module.css'

/**
 * Contêiner de bloco do dashboard: título (com `selo` ao lado), `extra`/`icone` à direita,
 * conteúdo e rodapé.
 */
export default function Painel({ titulo, selo, icone, extra, rodape, children, ocupado = false, className = '' }) {
  return (
    <section className={`${styles.painel} ${className}`} aria-label={typeof titulo === 'string' ? titulo : undefined} aria-busy={ocupado || undefined}>
      {(titulo || extra || icone) && (
        <header className={styles.cabecalho}>
          <div className={styles.grupoTitulo}>
            {titulo && <h2 className={styles.titulo}>{titulo}</h2>}
            {selo}
          </div>
          {extra && <div className={styles.extra}>{extra}</div>}
          {icone && <Icone nome={icone} tamanho={22} className={styles.icone} />}
        </header>
      )}
      <div className={styles.corpo}>{children}</div>
      {rodape && <footer className={styles.rodape}>{rodape}</footer>}
    </section>
  )
}
