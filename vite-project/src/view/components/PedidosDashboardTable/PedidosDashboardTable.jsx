import { ROTULO_SEM_CADASTRO, STATUS } from '../../../model/constants/pedidos.js'
import {
  formatarCodigo,
  formatarInteiro,
  formatarItens,
  formatarMoeda,
  formatarPontos,
} from '../../../model/entities/pedido.js'
import Chip from '../Chip/Chip.jsx'
import ChipPagamento from '../ChipPagamento/ChipPagamento.jsx'
import Esqueleto from '../Esqueleto/Esqueleto.jsx'
import EstadoBloco from '../EstadoBloco/EstadoBloco.jsx'
import Paginacao from '../Paginacao/Paginacao.jsx'
import Painel from '../Painel/Painel.jsx'
import styles from './PedidosDashboardTable.module.css'

const COLUNAS = ['# Pedido', 'Cliente', 'Itens', 'Pagamento', 'Valor total', 'Pontos ganhos']

function LinhasEsqueleto({ quantidade }) {
  return Array.from({ length: quantidade }, (_, i) => (
    <tr key={i} className={styles.linha}>
      {COLUNAS.map((c) => (
        <td key={c} data-rotulo={c}>
          <Esqueleto largura={c === 'Itens' ? '90%' : '70%'} />
        </td>
      ))}
    </tr>
  ))
}

/** Linha da tabela: `{ idPedido, statusPedido, nomeUsuario, itens, formaPagamento, valorTotal, pontosGerados }`. */
function LinhaPedido({ pedido }) {
  const cancelado = pedido.statusPedido === STATUS.CANCELADO
  const itens = formatarItens(pedido.itens)
  const temCliente = Boolean(pedido.nomeUsuario)
  return (
    <tr className={`${styles.linha} ${cancelado ? styles.cancelado : ''}`}>
      <td data-rotulo="# Pedido" className={`${styles.codigo} tabular`}>
        {formatarCodigo(pedido.idPedido)}
      </td>
      <td data-rotulo="Cliente" className={`${styles.cliente} ${temCliente ? '' : styles.semCadastro}`}>
        {temCliente ? pedido.nomeUsuario : ROTULO_SEM_CADASTRO}
      </td>
      <td data-rotulo="Itens" className={styles.itens} title={itens}>
        <span className={styles.reticencias}>{itens || '—'}</span>
      </td>
      <td data-rotulo="Pagamento">
        <ChipPagamento forma={pedido.formaPagamento} />
      </td>
      <td data-rotulo="Valor total" className={`${styles.valor} tabular`}>
        {cancelado ? (
          <>
            <s>{formatarMoeda(pedido.valorTotal)}</s>
            <span className="sr-only"> (cancelado)</span>
          </>
        ) : (
          formatarMoeda(pedido.valorTotal)
        )}
      </td>
      <td data-rotulo="Pontos ganhos">
        {cancelado ? (
          <Chip tom="cancelado">Cancelado</Chip>
        ) : temCliente ? (
          <Chip tom="pontos">{formatarPontos(pedido.pontosGerados)}</Chip>
        ) : (
          <span className={styles.semPontos} aria-label="Sem pontos (pedido sem cadastro)">—</span>
        )}
      </td>
    </tr>
  )
}

/** Tabela "Pedidos" do dashboard. Recebe o bloco `{ status, data, error }` e a paginação. */
export default function PedidosDashboardTable({ bloco, pagina, tamanho, onIrParaPagina, onTentarNovamente }) {
  const envelope = bloco.data
  const pedidos = envelope?.conteudo ?? []
  const carregando = bloco.status === 'loading'
  const vazio = bloco.status === 'success' && pedidos.length === 0

  const rodape =
    bloco.status === 'success' && envelope?.total > 0 ? (
      <>
        <p className="tabular">
          Mostrando {formatarInteiro(pedidos.length)} de {formatarInteiro(envelope.total)} pedidos
        </p>
        <Paginacao
          pagina={pagina}
          totalPaginas={envelope.totalPaginas}
          onIrPara={onIrParaPagina}
          desabilitado={bloco.recarregando}
          rotulo="Paginação da tabela de pedidos"
        />
      </>
    ) : null

  return (
    <Painel titulo="Pedidos" extra={<Chip tom="ao-vivo">Ao vivo</Chip>} rodape={rodape} ocupado={carregando || bloco.recarregando}>
      {bloco.status === 'error' ? (
        <EstadoBloco tipo="erro" mensagem={bloco.error?.message} acao={onTentarNovamente} />
      ) : vazio ? (
        <EstadoBloco mensagem="Nenhum pedido hoje ainda" />
      ) : (
        <div className={`${styles.rolagem} ${bloco.recarregando ? styles.recarregando : ''}`}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                {COLUNAS.map((c) => (
                  <th key={c} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <LinhasEsqueleto quantidade={tamanho} />
              ) : (
                pedidos.map((p) => <LinhaPedido key={p.idPedido} pedido={p} />)
              )}
            </tbody>
          </table>
        </div>
      )}
    </Painel>
  )
}
