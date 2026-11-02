import { DICA_PERIODO_DESABILITADO } from '../../../model/constants/periodos.js'
import styles from './PeriodoTabs.module.css'

/**
 * Abas de período. As desabilitadas usam aria-disabled (continuam focáveis para
 * mostrar a dica) e não chamam onSelecionar, então não geram requisição.
 */
export default function PeriodoTabs({ periodos, ativo, onSelecionar }) {
  return (
    <div className={styles.abas} role="tablist" aria-label="Período">
      {periodos.map((p) => {
        const selecionada = p.id === ativo
        const idDica = `dica-periodo-${p.id}`
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={selecionada}
            aria-disabled={!p.habilitado || undefined}
            aria-describedby={p.habilitado ? undefined : idDica}
            className={`${styles.aba} ${selecionada ? styles.ativa : ''}`}
            onClick={() => {
              if (p.habilitado && !selecionada) onSelecionar(p.id)
            }}
          >
            {p.rotulo}
            {!p.habilitado && (
              <span id={idDica} role="tooltip" className={styles.dica}>
                {DICA_PERIODO_DESABILITADO}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
