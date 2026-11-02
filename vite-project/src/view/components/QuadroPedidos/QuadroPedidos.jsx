import { useState } from 'react'
import { LISTAS_GESTAO } from '../../../model/constants/pedidos.js'
import CartaoPedido from '../CartaoPedido/CartaoPedido.jsx'
import Esqueleto from '../Esqueleto/Esqueleto.jsx'
import EstadoBloco from '../EstadoBloco/EstadoBloco.jsx'
import styles from './QuadroPedidos.module.css'

function Coluna({ definicao, bloco, ativa, renderAcoes, acaoEmAndamento, onTentarNovamente }) {
  const pedidos = bloco.data ?? []
  const idTitulo = `coluna-${definicao.chave}`
  return (
    <section
      id={`painel-${definicao.chave}`}
      className={`${styles.coluna} ${styles[definicao.tom]} ${ativa ? styles.ativa : ''}`}
      aria-labelledby={idTitulo}
      aria-busy={bloco.status === 'loading' || undefined}
    >
      <header className={styles.cabecalhoColuna}>
        <span className={styles.ponto} aria-hidden="true" />
        <h2 id={idTitulo} className={styles.tituloColuna}>
          {definicao.titulo}
        </h2>
        <span className={`${styles.contador} tabular`} aria-label={`${pedidos.length} pedidos`}>
          {bloco.status === 'success' ? pedidos.length : '–'}
        </span>
      </header>

      <div className={styles.rolagem}>
        {bloco.status === 'loading' &&
          [0, 1].map((i) => (
            <div key={i} className={styles.esqueleto} aria-hidden="true">
              <Esqueleto largura="40%" />
              <Esqueleto largura="70%" />
              <Esqueleto largura="90%" />
            </div>
          ))}
        {bloco.status === 'error' && (
          <EstadoBloco tipo="erro" compacto mensagem={bloco.error?.message} acao={onTentarNovamente} />
        )}
        {bloco.status === 'success' && pedidos.length === 0 && <EstadoBloco compacto mensagem="Nenhum pedido" />}
        {bloco.status === 'success' &&
          pedidos.map((pedido) => (
            <CartaoPedido
              key={pedido.id}
              pedido={pedido}
              lista={definicao.chave}
              tom={definicao.tom}
              ocupado={acaoEmAndamento === pedido.id}
              acoes={renderAcoes?.(definicao.chave, pedido)}
            />
          ))}
      </div>
    </section>
  )
}

/**
 * Quadro com as 4 colunas de status. Em telas pequenas mostra uma coluna por vez,
 * com abas de status (estado local de interface).
 */
export default function QuadroPedidos({ listas, renderAcoes, acaoEmAndamento, onTentarNovamente }) {
  const [colunaAtiva, setColunaAtiva] = useState(LISTAS_GESTAO[0].chave)

  return (
    <div className={styles.quadro}>
      <div className={styles.abasStatus} role="tablist" aria-label="Status dos pedidos">
        {LISTAS_GESTAO.map((def) => {
          const bloco = listas[def.chave]
          const ativa = def.chave === colunaAtiva
          return (
            <button
              key={def.chave}
              type="button"
              role="tab"
              aria-selected={ativa}
              aria-controls={`painel-${def.chave}`}
              className={`${styles.abaStatus} ${styles[def.tom]} ${ativa ? styles.abaAtiva : ''}`}
              onClick={() => setColunaAtiva(def.chave)}
            >
              <span className={styles.ponto} aria-hidden="true" />
              {def.titulo}
              <span className={`${styles.contador} tabular`}>{bloco.status === 'success' ? bloco.data.length : '–'}</span>
            </button>
          )
        })}
      </div>

      <div className={styles.colunas}>
        {LISTAS_GESTAO.map((def) => (
          <Coluna
            key={def.chave}
            definicao={def}
            bloco={listas[def.chave]}
            ativa={def.chave === colunaAtiva}
            renderAcoes={renderAcoes}
            acaoEmAndamento={acaoEmAndamento}
            onTentarNovamente={onTentarNovamente}
          />
        ))}
      </div>
    </div>
  )
}
