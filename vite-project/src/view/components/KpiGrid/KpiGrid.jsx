import {
  formatarInteiro,
  formatarMoeda,
  formatarVariacao,
} from '../../../model/entities/pedido.js'
import EstadoBloco from '../EstadoBloco/EstadoBloco.jsx'
import KpiCard from '../KpiCard/KpiCard.jsx'
import styles from './KpiGrid.module.css'

const ehNumero = (v) => typeof v === 'number' && Number.isFinite(v)

function plural(n, singular, pluralTexto) {
  return `${formatarInteiro(n)} ${n === 1 ? singular : pluralTexto}`
}

/**
 * Monta os 4 cartões a partir do retorno de GET /pedidos/dashboard/kpis, só formatando (sem recalcular):
 * { faturamento, quantidadePedidos, variacaoPedidos, ticketMedio, ticketMedioAnterior, clientesAtendidos }.
 * `variacaoPedidos`, `ticketMedio` e `ticketMedioAnterior` podem vir null.
 */
function montarCartoes(dados, rotuloPeriodo) {
  const variacaoPedidos = dados?.variacaoPedidos
  const variacao = formatarVariacao(variacaoPedidos)
  const tomVariacao = !ehNumero(variacaoPedidos) || Math.round(variacaoPedidos) === 0
    ? 'neutro'
    : variacaoPedidos > 0 ? 'positivo' : 'negativo'

  const ticket = dados?.ticketMedio
  const ticketAnterior = dados?.ticketMedioAnterior
  const temTicket = ehNumero(ticket)

  return [
    {
      id: 'faturamento',
      icone: 'dinheiro',
      titulo: `Faturamento ${rotuloPeriodo}`,
      valor: formatarMoeda(dados?.faturamento ?? 0),
    },
    {
      id: 'pedidos',
      icone: 'pedidos',
      titulo: `Pedidos ${rotuloPeriodo}`,
      valor: plural(dados?.quantidadePedidos ?? 0, 'pedido', 'pedidos'),
      apoio: variacao ? `${variacao} vs. ontem` : null,
      tomApoio: tomVariacao,
    },
    {
      id: 'ticket',
      icone: 'voucher',
      titulo: 'Ticket médio',
      valor: temTicket ? formatarMoeda(ticket) : '—',
      apoio: temTicket && ehNumero(ticketAnterior) ? `Ontem: ${formatarMoeda(ticketAnterior)}` : null,
    },
    {
      id: 'clientes',
      icone: 'clientes',
      titulo: 'Clientes atendidos',
      valor: plural(dados?.clientesAtendidos ?? 0, 'cliente', 'clientes'),
    },
  ]
}

export default function KpiGrid({ bloco, rotuloPeriodo, onTentarNovamente }) {
  if (bloco.status === 'error') {
    return (
      <section className={styles.erro} aria-label="Indicadores">
        <EstadoBloco tipo="erro" mensagem={bloco.error?.message} acao={onTentarNovamente} />
      </section>
    )
  }

  const carregando = bloco.status === 'loading'
  const cartoes = montarCartoes(bloco.data, rotuloPeriodo)

  return (
    <section className={styles.grade} aria-label="Indicadores" aria-busy={carregando || undefined}>
      {cartoes.map((c) => (
        <KpiCard key={c.id} {...c} carregando={carregando} />
      ))}
    </section>
  )
}
