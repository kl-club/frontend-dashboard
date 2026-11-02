import styles from './Esqueleto.module.css'

/** Placeholder animado para carregamento. */
export default function Esqueleto({ largura = '100%', altura = 14, raio, className = '' }) {
  return (
    <span
      className={`${styles.esqueleto} ${className}`}
      style={{ width: largura, height: altura, borderRadius: raio }}
      aria-hidden="true"
    />
  )
}
