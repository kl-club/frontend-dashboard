import {
  formatarInteiro,
  formatarMoeda,
  formatarPercentual,
  formatarVariacao,
} from '../../../model/entities/pedido.js'
import EstadoBloco from '../EstadoBloco/EstadoBloco.jsx'
import KpiCard from '../KpiCard/KpiCard.jsx'
import styles from './KpiGrid.module.css'

const ehNumero = (v) => typeof v === 'number' && Number.isFinite(v)

function plural(n, singular, pluralTexto) {
  return `${formatarInteiro(n)} ${n === 1 ? singular : pluralTexto}`
}

/** Monta os 4 cartões a partir do retorno de /kpis, só formatando (sem recalcular). */
function montarCartoes(dados, rotuloPeriodo) {
  const faturamento = dados?.faturamento ?? {}
  const pedidos = dados?.pedidos ?? {}
  const ticket = dados?.ticketMedio ?? {}
  const clientes = dados?.clientesAtendidos ?? {}

  const variacao = formatarVariacao(pedidos.variacaoPercentual)
  const tomVariacao = !ehNumero(pedidos.variacaoPercentual) || Math.round(pedidos.variacaoPercentual) === 0
    ? 'neutro'
    : pedidos.variacaoPercentual > 0 ? 'positivo' : 'negativo'

  const temTicket = ehNumero(ticket.valor)

  return [
    {
      id: 'faturamento',
      icone: 'dinheiro',
      titulo: `Faturamento ${rotuloPeriodo}`,
      valor: formatarMoeda(faturamento.valor ?? 0),
      apoio: ehNumero(faturamento.meta) ? `Meta: ${formatarMoeda(faturamento.meta)}` : null,
    },
    {
      id: 'pedidos',
      icone: 'pedidos',
      titulo: `Pedidos ${rotuloPeriodo}`,
      valor: plural(pedidos.quantidade ?? 0, 'pedido', 'pedidos'),
      apoio: variacao ? `${variacao} vs. ontem` : null,
      tomApoio: tomVariacao,
    },
    {
      id: 'ticket',
      icone: 'voucher',
      titulo: 'Ticket médio',
      valor: temTicket ? formatarMoeda(ticket.valor) : '—',
      apoio: temTicket && ehNumero(ticket.valorPeriodoAnterior) ? `Ontem: ${formatarMoeda(ticket.valorPeriodoAnterior)}` : null,
    },
    {
      id: 'clientes',
      icone: 'clientes',
      titulo: 'Clientes atendidos',
      valor: plural(clientes.quantidade ?? 0, 'cliente', 'clientes'),
      apoio: ehNumero(clientes.percentualViaTotem) ? `${formatarPercentual(clientes.percentualViaTotem)} via Totem` : null,
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
