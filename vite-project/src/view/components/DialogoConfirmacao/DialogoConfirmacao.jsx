import { useEffect, useId, useRef } from 'react'
import BotaoAcao from '../BotaoAcao/BotaoAcao.jsx'
import styles from './DialogoConfirmacao.module.css'

/**
 * Confirmação modal sobre <dialog>: `showModal()` prende o foco dentro do diálogo
 * e Esc fecha (evento `cancel`). O foco inicial vai para o botão de cancelar.
 */
export default function DialogoConfirmacao({
  aberto,
  titulo,
  mensagem,
  rotuloConfirmar = 'Confirmar',
  rotuloCancelar = 'Voltar',
  perigo = false,
  onConfirmar,
  onCancelar,
}) {
  const ref = useRef(null)
  const cancelarRef = useRef(null)
  const idTitulo = useId()
  const idMensagem = useId()

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    if (aberto && !dialogo.open) {
      dialogo.showModal()
      cancelarRef.current?.focus()
    } else if (!aberto && dialogo.open) {
      dialogo.close()
    }
  }, [aberto])

  return (
    <dialog
      ref={ref}
      className={styles.dialogo}
      aria-labelledby={idTitulo}
      aria-describedby={idMensagem}
      onCancel={(e) => {
        e.preventDefault()
        onCancelar()
      }}
      onClick={(e) => {
        // Clique no fundo (fora da caixa) cancela.
        if (e.target === ref.current) onCancelar()
      }}
    >
      <div className={styles.caixa}>
        <h2 id={idTitulo} className={styles.titulo}>
          {titulo}
        </h2>
        <p id={idMensagem} className={styles.mensagem}>
          {mensagem}
        </p>
        <div className={styles.botoes}>
          <BotaoAcao variante="secundario" onClick={onCancelar} ref={cancelarRef}>
            {rotuloCancelar}
          </BotaoAcao>
          <BotaoAcao variante={perigo ? 'perigoCheio' : 'primario'} onClick={onConfirmar}>
            {rotuloConfirmar}
          </BotaoAcao>
        </div>
      </div>
    </dialog>
  )
}
