import Icone from '../Icone/Icone.jsx'
import styles from './EstadoBloco.module.css'

/**
 * Mensagem de erro ou de vazio dentro de um bloco, com ação opcional.
 * Erro: role="alert" e botão "Tentar novamente".
 */
export default function EstadoBloco({ tipo = 'vazio', mensagem, acao, rotuloAcao, compacto = false }) {
  const erro = tipo === 'erro'
  return (
    <div className={`${styles.estado} ${erro ? styles.erro : ''} ${compacto ? styles.compacto : ''}`} role={erro ? 'alert' : undefined}>
      {erro && <Icone nome="alerta" tamanho={20} />}
      <p>{mensagem}</p>
      {acao && (
        <button type="button" className={styles.botao} onClick={acao}>
          {erro && <Icone nome="atualizar" tamanho={16} />}
          {rotuloAcao ?? (erro ? 'Tentar novamente' : 'Limpar')}
        </button>
      )}
    </div>
  )
}
