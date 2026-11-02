// Enumerações do recurso /pedidos (AGENTS.md §4.2).

export const STATUS = Object.freeze({
  PENDENTE: 'PENDENTE',
  PAGO: 'PAGO',
  EM_PREPARO: 'EM_PREPARO',
  PRONTO_PARA_RETIRADA: 'PRONTO_PARA_RETIRADA',
  CONCLUIDO: 'CONCLUIDO',
  CANCELADO: 'CANCELADO',
})

export const MODALIDADE = Object.freeze({
  RETIRADA: 'RETIRADA',
  CONSUMO_LOCAL: 'CONSUMO_LOCAL',
})

export const ROTULO_MODALIDADE = Object.freeze({
  RETIRADA: 'Retirada Balcão',
  CONSUMO_LOCAL: 'Consumo Local',
})

/** Modalidades aceitas no filtro do histórico (só as da spec). */
export const MODALIDADES_FILTRO = Object.freeze([
  { valor: '', rotulo: 'Todas' },
  { valor: MODALIDADE.RETIRADA, rotulo: 'Retirada' },
  { valor: MODALIDADE.CONSUMO_LOCAL, rotulo: 'Consumo no local' },
])

export const FORMA_PAGAMENTO = Object.freeze({
  PIX: 'PIX',
  CARTAO_CREDITO: 'CARTAO_CREDITO',
  CARTAO_DEBITO: 'CARTAO_DEBITO',
  DINHEIRO: 'DINHEIRO',
  VOUCHER: 'VOUCHER',
})

export const ROTULO_PAGAMENTO = Object.freeze({
  PIX: 'PIX Instantâneo',
  CARTAO_CREDITO: 'Cartão de Crédito',
  CARTAO_DEBITO: 'Cartão de Débito',
  DINHEIRO: 'Dinheiro',
  VOUCHER: 'Voucher',
})

/** Rótulo curto, usado em "Total (PIX):". */
export const ROTULO_PAGAMENTO_CURTO = Object.freeze({
  PIX: 'PIX',
  CARTAO_CREDITO: 'Crédito',
  CARTAO_DEBITO: 'Débito',
  DINHEIRO: 'Dinheiro',
  VOUCHER: 'Voucher',
})

/** Formas agrupadas na distribuição de pagamentos do dashboard. */
export const ROTULO_FORMA_DISTRIBUICAO = Object.freeze({
  PIX: 'PIX (Instantâneo)',
  CARTAO: 'Cartão de Crédito / Débito',
  DINHEIRO: 'Dinheiro (Espécie)',
  VOUCHER: 'VR / Refeição / Vouchers',
})

/** Listas do quadro de gestão (§5.2), na ordem das colunas. */
export const LISTAS_GESTAO = Object.freeze([
  {
    chave: 'novos',
    rota: 'novos',
    titulo: 'Novos Pedidos',
    tom: 'novo',
    status: [STATUS.PENDENTE, STATUS.PAGO],
  },
  {
    chave: 'emPreparo',
    rota: 'em-preparo',
    titulo: 'Em Preparo',
    tom: 'preparo',
    status: [STATUS.EM_PREPARO],
  },
  {
    chave: 'prontos',
    rota: 'prontos',
    titulo: 'Prontos para Retirada',
    tom: 'pronto',
    status: [STATUS.PRONTO_PARA_RETIRADA],
  },
  {
    chave: 'concluidos',
    rota: 'concluidos',
    titulo: 'Concluídos',
    tom: 'concluido',
    status: [STATUS.CONCLUIDO],
  },
])

/** Chave da lista do quadro em que um status aparece, ou null (cancelado/desconhecido). */
export function listaDoStatus(status) {
  return LISTAS_GESTAO.find((l) => l.status.includes(status))?.chave ?? null
}

export const INTERVALO_ATUALIZACAO_MS = 30_000
export const FUSO_HORARIO = 'America/Sao_Paulo'
