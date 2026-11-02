import Icone from '../Icone/Icone.jsx'
import styles from './BotaoAtualizar.module.css'

/** Botão só com ícone para recarregar; gira enquanto `carregando`. */
export default function BotaoAtualizar({ onClick, carregando = false, desabilitado = false }) {
  return (
    <button
      type="button"
      className={styles.botao}
      onClick={onClick}
      disabled={desabilitado}
      aria-label="Atualizar"
      title="Atualizar"
      aria-busy={carregando || undefined}
    >
      <Icone nome="atualizar" tamanho={18} className={carregando ? styles.girando : undefined} />
    </button>
  )
}
