import styles from './BotaoAcao.module.css'

/**
 * Botão de texto. variante: primario | secundario | perigo.
 * Com `carregando`, fica desabilitado e mostra um indicador.
 */
export default function BotaoAcao({
  children,
  onClick,
  variante = 'primario',
  carregando = false,
  desabilitado = false,
  tipo = 'button',
  largo = false,
  ...resto
}) {
  return (
    <button
      type={tipo}
      className={`${styles.botao} ${styles[variante] ?? ''} ${largo ? styles.largo : ''}`}
      onClick={onClick}
      disabled={desabilitado || carregando}
      aria-busy={carregando || undefined}
      {...resto}
    >
      {carregando && <span className={styles.indicador} aria-hidden="true" />}
      {children}
    </button>
  )
}
