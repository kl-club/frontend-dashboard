import styles from './Painel.module.css'

/** Contêiner de bloco do dashboard: título, extra à direita, conteúdo e rodapé. */
export default function Painel({ titulo, extra, rodape, children, ocupado = false, className = '' }) {
  return (
    <section className={`${styles.painel} ${className}`} aria-label={typeof titulo === 'string' ? titulo : undefined} aria-busy={ocupado || undefined}>
      {(titulo || extra) && (
        <header className={styles.cabecalho}>
          {titulo && <h2 className={styles.titulo}>{titulo}</h2>}
          {extra && <div className={styles.extra}>{extra}</div>}
        </header>
      )}
      <div className={styles.corpo}>{children}</div>
      {rodape && <footer className={styles.rodape}>{rodape}</footer>}
    </section>
  )
}
