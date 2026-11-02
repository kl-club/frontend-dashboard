// Funções puras de formatação e rótulos do Pedido (AGENTS.md §8).
// Não conhecem React nem HTTP: recebem dados e devolvem texto.

import {
  FUSO_HORARIO,
  MODALIDADE,
  ROTULO_FORMA_DISTRIBUICAO,
  ROTULO_MODALIDADE,
  ROTULO_PAGAMENTO,
  ROTULO_PAGAMENTO_CURTO,
} from '../constants/pedidos.js'

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const dataHora = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO_HORARIO,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const TRACO = '—'

function ehNumero(valor) {
  return typeof valor === 'number' && Number.isFinite(valor)
}

/** 3420 → "R$ 3.420,00". Valor ausente → "—". */
export function formatarMoeda(valor) {
  return ehNumero(valor) ? moeda.format(valor) : TRACO
}

/** 1234 → "1.234". */
export function formatarInteiro(valor) {
  return ehNumero(valor) ? inteiro.format(valor) : TRACO
}

/** 56 → "+56 pts". */
export function formatarPontos(pontos) {
  const n = ehNumero(pontos) ? Math.trunc(pontos) : 0
  return `+${inteiro.format(n)} pts`
}

/** 1084 → "#1084". */
export function formatarCodigo(id) {
  return `#${id}`
}

/** [{nome, quantidade}] → "2× Suco Verde, 1× Combo Fit". */
export function formatarItens(itens) {
  if (!Array.isArray(itens) || itens.length === 0) return ''
  return itens.map(formatarItem).join(', ')
}

/** {nome, quantidade} → "2× Suco Verde". */
export function formatarItem(item) {
  const quantidade = ehNumero(item?.quantidade) ? item.quantidade : 1
  return `${quantidade}× ${item?.nome ?? ''}`.trim()
}

/** ISO → "02/11/2026 14:05" no fuso de São Paulo. */
export function formatarDataHora(iso) {
  if (!iso) return TRACO
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return TRACO
  const partes = Object.fromEntries(dataHora.formatToParts(data).map((p) => [p.type, p.value]))
  return `${partes.day}/${partes.month}/${partes.year} ${partes.hour}:${partes.minute}`
}

/** "11988412290" → "(11) 98841-2290". Outros formatos voltam como vieram. */
export function formatarTelefone(telefone) {
  if (!telefone) return ''
  const d = String(telefone).replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return String(telefone)
}

/** Tempo desde `iso`: "Agora", "Há 1 min", "Há 2 h", "Há 3 dias". */
export function tempoRelativo(iso, agora = Date.now()) {
  if (!iso) return ''
  const instante = new Date(iso).getTime()
  if (Number.isNaN(instante)) return ''
  const minutos = Math.max(0, Math.floor((agora - instante) / 60_000))
  if (minutos < 1) return 'Agora'
  if (minutos < 60) return `Há ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `Há ${horas} h`
  const dias = Math.floor(horas / 24)
  return dias === 1 ? 'Há 1 dia' : `Há ${dias} dias`
}

/**
 * Rótulo da modalidade. Em CONSUMO_LOCAL com mesa: "Consumo Local / Mesa 02".
 * Valor desconhecido: o código bruto.
 */
export function rotuloModalidade(modalidade, mesa) {
  const rotulo = ROTULO_MODALIDADE[modalidade] ?? modalidade ?? TRACO
  if (modalidade === MODALIDADE.CONSUMO_LOCAL && mesa) return `${rotulo} / Mesa ${mesa}`
  return rotulo
}

/** "PIX" → "PIX Instantâneo". Valor desconhecido: o código bruto. */
export function rotuloPagamento(forma) {
  return ROTULO_PAGAMENTO[forma] ?? forma ?? TRACO
}

/** "PIX" → "PIX"; "CARTAO_CREDITO" → "Crédito". */
export function rotuloPagamentoCurto(forma) {
  return ROTULO_PAGAMENTO_CURTO[forma] ?? forma ?? TRACO
}

/** "CARTAO" → "Cartão de Crédito / Débito". */
export function rotuloFormaDistribuicao(forma) {
  return ROTULO_FORMA_DISTRIBUICAO[forma] ?? forma ?? TRACO
}

/** 12 → "+12%"; -4.6 → "−5%"; 0 → "0%"; null → null. */
export function formatarVariacao(percentual) {
  if (!ehNumero(percentual)) return null
  const n = Math.round(percentual)
  if (n === 0) return '0%'
  return `${n > 0 ? '+' : '−'}${Math.abs(n)}%`
}

/** 40.4 → "40%". */
export function formatarPercentual(percentual) {
  return ehNumero(percentual) ? `${Math.round(percentual)}%` : TRACO
}

/** Texto de busca → parâmetro do histórico: dígitos (com # opcional) viram `codigo`. */
export function interpretarBusca(texto) {
  const limpo = (texto ?? '').trim()
  if (!limpo) return {}
  const codigo = limpo.match(/^#?\s*(\d+)$/)
  return codigo ? { codigo: Number(codigo[1]) } : { cliente: limpo }
}
