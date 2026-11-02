import { MODALIDADE, STATUS } from '../../../model/constants/pedidos.js'
import {
  formatarCodigo,
  formatarDataHora,
  formatarInteiro,
  formatarItens,
  formatarMoeda,
  formatarPontos,
  formatarTelefone,
  rotuloModalidade,
} from '../../../model/entities/pedido.js'
import Chip from '../Chip/Chip.jsx'
import Esqueleto from '../Esqueleto/Esqueleto.jsx'
import EstadoBloco from '../EstadoBloco/EstadoBloco.jsx'
import Icone from '../Icone/Icone.jsx'
import Paginacao from '../Paginacao/Paginacao.jsx'
import styles from './HistoricoTable.module.css'

const COLUNAS = ['Pedido', 'Cliente', 'Valor total', 'Itens do pedido', 'Modalidade', 'Data & horário']

const TOM_MODALIDADE = {
  [MODALIDADE.RETIRADA]: 'verde',
  [MODALIDADE.CONSUMO_LOCAL]: 'laranja',
}

const ARIA_SORT = { desc: 'descending', asc: 'ascending' }
const ICONE_ORDEM = { desc: 'ordenarDesc', asc: 'ordenarAsc' }
const DICA_ORDEM = {
  null: 'Ordenar por valor (maior primeiro)',
  desc: 'Ordenar por valor (menor primeiro)',
  asc: 'Remover ordenação (mais recentes primeiro)',
}

function SegundaLinhaCliente({ pedido }) {
  if (pedido.status === STATUS.CANCELADO) {
    return <span className={styles.motivo}>{pedido.motivoCancelamento || 'Cancelado'}</span>
  }
  if (pedido.modalidade === MODALIDADE.CONSUMO_LOCAL && pedido.mesa) {
    return <span className={styles.mesa}>Mesa {pedido.mesa} // Salão</span>
  }
  const telefone = formatarTelefone(pedido.cliente?.telefone)
  return telefone ? <span className={`${styles.telefone} tabular`}>{telefone}</span> : null
}

function Linha({ pedido }) {
  const cancelado = pedido.status === STATUS.CANCELADO
  const itens = formatarItens(pedido.itens)
  return (
    <tr className={`${styles.linha} ${cancelado ? styles.cancelado : ''}`}>
      <td data-rotulo="Pedido" className={`${styles.codigo} tabular`}>
        {formatarCodigo(pedido.id)}
      </td>
      <td data-rotulo="Cliente">
        <span className={styles.cliente}>
          <strong>{pedido.cliente?.nome ?? '—'}</strong>
          <SegundaLinhaCliente pedido={pedido} />
        </span>
      </td>
      <td data-rotulo="Valor total">
        <span className={styles.valor}>
          {cancelado ? (
            <>
              <s className="tabular">{formatarMoeda(pedido.valorTotal)}</s>
              <Chip tom="cancelado">Cancelado</Chip>
            </>
          ) : (
            <>
              <span className="tabular">{formatarMoeda(pedido.valorTotal)}</span>
              <Chip tom="pontos">{formatarPontos(pedido.pontosGanhos)}</Chip>
            </>
          )}
        </span>
      </td>
      <td data-rotulo="Itens do pedido" className={styles.itens} title={itens}>
        <span className={styles.reticencias}>{itens || '—'}</span>
      </td>
      <td data-rotulo="Modalidade">
        <Chip tom={cancelado ? 'apagado' : (TOM_MODALIDADE[pedido.modalidade] ?? 'neutro')}>
          {rotuloModalidade(pedido.modalidade)}
        </Chip>
      </td>
      <td data-rotulo="Data & horário" className={`${styles.data} tabular`}>
        <time dateTime={pedido.criadoEm}>{formatarDataHora(pedido.criadoEm)}</time>
      </td>
    </tr>
  )
}

export default function HistoricoTable({ bloco, ordenacao, onAlternarOrdenacao, onIrParaPagina, onTentarNovamente, onLimparFiltros, tamanho }) {
  const envelope = bloco.data
  const pedidos = envelope?.conteudo ?? []
  const carregando = bloco.status === 'loading'

  if (bloco.status === 'error') {
    return (
      <div className={styles.painel}>
        <EstadoBloco tipo="erro" mensagem={bloco.error?.message} acao={onTentarNovamente} />
      </div>
    )
  }

  if (bloco.status === 'success' && pedidos.length === 0) {
    return (
      <div className={styles.painel}>
        <EstadoBloco
          mensagem="Nenhum pedido encontrado com esses filtros"
          acao={onLimparFiltros}
          rotuloAcao="Limpar filtros"
        />
      </div>
    )
  }

  const inicio = envelope ? (envelope.pagina - 1) * envelope.tamanho + 1 : 0
  const fim = envelope ? inicio + pedidos.length - 1 : 0

  return (
    <div className={styles.painel} aria-busy={carregando || bloco.recarregando || undefined}>
      <div className={`${styles.rolagem} ${bloco.recarregando ? styles.recarregando : ''}`}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              {COLUNAS.map((c) =>
                c === 'Valor total' ? (
                  <th key={c} scope="col" aria-sort={ARIA_SORT[ordenacao] ?? 'none'}>
                    <button type="button" className={styles.ordenar} onClick={onAlternarOrdenacao} title={DICA_ORDEM[ordenacao]}>
                      {c}
                      <Icone nome={ICONE_ORDEM[ordenacao] ?? 'ordenar'} tamanho={14} />
                    </button>
                  </th>
                ) : (
                  <th key={c} scope="col">
                    {c}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {carregando
              ? Array.from({ length: Math.min(tamanho, 6) }, (_, i) => (
                  <tr key={i} className={styles.linha}>
                    {COLUNAS.map((c) => (
                      <td key={c} data-rotulo={c}>
                        <Esqueleto largura="75%" />
                      </td>
                    ))}
                  </tr>
                ))
              : pedidos.map((p) => <Linha key={p.id} pedido={p} />)}
          </tbody>
        </table>
      </div>

      {bloco.status === 'success' && (
        <footer className={styles.rodape}>
          <p className="tabular">
            Exibindo {formatarInteiro(inicio)}–{formatarInteiro(fim)} de {formatarInteiro(envelope.total)} registros
          </p>
          <Paginacao
            pagina={envelope.pagina}
            totalPaginas={envelope.totalPaginas}
            onIrPara={onIrParaPagina}
            desabilitado={bloco.recarregando}
            rotulo="Paginação do histórico"
          />
        </footer>
      )}
    </div>
  )
}
