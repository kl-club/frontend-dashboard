import { useEffect } from 'react'
import Icone from '../Icone/Icone.jsx'
import styles from './Aviso.module.css'

const DURACAO_MS = 6000

/**
 * Região aria-live="polite" sempre presente; o aviso aparece dentro dela.
 * `aviso`: { tipo: 'sucesso' | 'erro', mensagem, chave } ou null.
 */
export default function Aviso({ aviso, onFechar }) {
  useEffect(() => {
    if (!aviso) return undefined
    const timer = setTimeout(onFechar, DURACAO_MS)
    return () => clearTimeout(timer)
  }, [aviso, onFechar])

  return (
    <div className={styles.regiao} aria-live="polite" aria-atomic="true">
      {aviso && (
        <div key={aviso.chave} className={`${styles.aviso} ${aviso.tipo === 'erro' ? styles.erro : styles.sucesso}`}>
          <Icone nome={aviso.tipo === 'erro' ? 'alerta' : 'check'} tamanho={18} />
          <p className={styles.texto}>{aviso.mensagem}</p>
          <button type="button" className={styles.fechar} onClick={onFechar} aria-label="Fechar aviso">
            <Icone nome="fechar" tamanho={16} />
          </button>
        </div>
      )}
    </div>
  )
}
