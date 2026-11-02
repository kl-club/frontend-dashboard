import Icone from '../Icone/Icone.jsx'
import styles from './Chip.module.css'

/**
 * Chip/selo de texto curto (nunca quebra linha).
 * tom: neutro | verde | pontos | cancelado | laranja | apagado | ao-vivo
 */
export default function Chip({ tom = 'neutro', icone, children, title, className = '' }) {
  return (
    <span className={`${styles.chip} ${styles[tom] ?? ''} ${className}`} title={title}>
      {icone && <Icone nome={icone} tamanho={14} />}
      {children}
    </span>
  )
}
