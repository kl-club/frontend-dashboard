import { useId } from 'react'
import Icone from '../Icone/Icone.jsx'
import styles from './CampoBusca.module.css'

export default function CampoBusca({ valor, onMudar, placeholder, rotulo }) {
  const id = useId()
  return (
    <div className={styles.campo} role="search">
      <label htmlFor={id} className="sr-only">
        {rotulo ?? placeholder}
      </label>
      <Icone nome="busca" tamanho={18} className={styles.icone} />
      <input
        id={id}
        type="search"
        className={styles.input}
        value={valor}
        placeholder={placeholder}
        onChange={(e) => onMudar(e.target.value)}
        autoComplete="off"
        enterKeyHint="search"
      />
      {valor && (
        <button type="button" className={styles.limpar} onClick={() => onMudar('')} aria-label="Limpar campo">
          <Icone nome="fechar" tamanho={16} />
        </button>
      )}
    </div>
  )
}
