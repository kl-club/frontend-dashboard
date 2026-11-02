import { useId, useState } from 'react'
import { MODALIDADES_FILTRO } from '../../../model/constants/pedidos.js'
import BotaoAcao from '../BotaoAcao/BotaoAcao.jsx'
import styles from './PainelFiltros.module.css'

/**
 * Painel com Data inicial, Data final e Modalidade. Edita um rascunho local e só
 * envia ao clicar em Aplicar. Limpar zera os três filtros e aplica.
 */
export default function PainelFiltros({ id, valores, onAplicar, onFechar }) {
  const [rascunho, setRascunho] = useState({
    dataInicio: valores.dataInicio ?? '',
    dataFim: valores.dataFim ?? '',
    modalidade: valores.modalidade ?? '',
  })
  const idBase = useId()
  const intervaloInvalido = rascunho.dataInicio && rascunho.dataFim && rascunho.dataInicio > rascunho.dataFim

  const mudar = (campo) => (e) => setRascunho((r) => ({ ...r, [campo]: e.target.value }))

  function aplicar(e) {
    e.preventDefault()
    if (intervaloInvalido) return
    onAplicar(rascunho)
    onFechar()
  }

  function limpar() {
    const vazio = { dataInicio: '', dataFim: '', modalidade: '' }
    setRascunho(vazio)
    onAplicar(vazio)
    onFechar()
  }

  return (
    <form
      id={id}
      className={styles.painel}
      onSubmit={aplicar}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onFechar()
      }}
      aria-label="Filtros do histórico"
    >
      <div className={styles.campos}>
        <label className={styles.campo} htmlFor={`${idBase}-inicio`}>
          <span>Data inicial</span>
          <input id={`${idBase}-inicio`} type="date" value={rascunho.dataInicio} max={rascunho.dataFim || undefined} onChange={mudar('dataInicio')} />
        </label>
        <label className={styles.campo} htmlFor={`${idBase}-fim`}>
          <span>Data final</span>
          <input
            id={`${idBase}-fim`}
            type="date"
            value={rascunho.dataFim}
            min={rascunho.dataInicio || undefined}
            onChange={mudar('dataFim')}
            aria-invalid={intervaloInvalido || undefined}
            aria-describedby={intervaloInvalido ? `${idBase}-erro` : undefined}
          />
        </label>
        <label className={styles.campo} htmlFor={`${idBase}-modalidade`}>
          <span>Modalidade</span>
          <select id={`${idBase}-modalidade`} value={rascunho.modalidade} onChange={mudar('modalidade')}>
            {MODALIDADES_FILTRO.map((m) => (
              <option key={m.valor} value={m.valor}>
                {m.rotulo}
              </option>
            ))}
          </select>
        </label>
      </div>

      {intervaloInvalido && (
        <p id={`${idBase}-erro`} className={styles.erro} role="alert">
          A data final deve ser igual ou posterior à data inicial.
        </p>
      )}

      <div className={styles.botoes}>
        <BotaoAcao variante="secundario" onClick={limpar}>
          Limpar
        </BotaoAcao>
        <BotaoAcao tipo="submit" desabilitado={Boolean(intervaloInvalido)}>
          Aplicar
        </BotaoAcao>
      </div>
    </form>
  )
}
