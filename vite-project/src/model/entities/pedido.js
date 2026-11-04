// Funções puras de formatação e rótulos do Pedido.
// Não conhecem React nem HTTP: recebem dados e devolvem texto.

import {
  FUSO_HORARIO,
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

// A API devolve datas sem fuso ("2026-11-02T14:07:00"), sempre no horário de São Paulo.
// São Paulo não tem horário de verão desde 2019, então o deslocamento é fixo.
const DESLOCAMENTO_SAO_PAULO = '-03:00'
const TEM_FUSO = /(Z|[+-]\d{2}:?\d{2})$/i

/** Converte a data da API em Date, tratando datas sem fuso como horário de São Paulo. */
export function lerDataApi(iso) {
  if (!iso) return null
  const texto = String(iso)
  const comFuso = texto.includes('T') && !TEM_FUSO.test(texto) ? `${texto}${DESLOCAMENTO_SAO_PAULO}` : texto
  const data = new Date(comFuso)
  return Number.isNaN(data.getTime()) ? null : data
}

/** ISO → "02/11/2026 14:05" no fuso de São Paulo. */
export function formatarDataHora(iso) {
  const data = lerDataApi(iso)
  if (!data) return TRACO
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
  const data = lerDataApi(iso)
  if (!data) return ''
  const instante = data.getTime()
  const minutos = Math.max(0, Math.floor((agora - instante) / 60_000))
  if (minutos < 1) return 'Agora'
  if (minutos < 60) return `Há ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `Há ${horas} h`
  const dias = Math.floor(horas / 24)
  return dias === 1 ? 'Há 1 dia' : `Há ${dias} dias`
}

/** "RETIRADA" → "Retirada Balcão"; "LOCAL" → "Consumo Local". Valor desconhecido: o código bruto. */
export function rotuloModalidade(modalidade) {
  return ROTULO_MODALIDADE[modalidade] ?? modalidade ?? TRACO
}

/** "PIX" → "PIX Instantâneo". Valor desconhecido: o código bruto. */
export function rotuloPagamento(forma) {
  return ROTULO_PAGAMENTO[forma] ?? forma ?? TRACO
}

/** "PIX" → "PIX"; "CREDITO" → "Crédito". */
export function rotuloPagamentoCurto(forma) {
  return ROTULO_PAGAMENTO_CURTO[forma] ?? forma ?? TRACO
}

/** "CREDITO" → "Cartão de Crédito". */
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

/**
 * Texto de busca → parâmetro do histórico: dígitos (com # opcional) viram `idPedido`;
 * o resto vira `nomeUsuario`. O id segue como texto para a API validar números fora do limite.
 */
export function interpretarBusca(texto) {
  const limpo = (texto ?? '').trim()
  if (!limpo) return {}
  const codigo = limpo.match(/^#?\s*(\d+)$/)
  return codigo ? { idPedido: codigo[1] } : { nomeUsuario: limpo }
}
