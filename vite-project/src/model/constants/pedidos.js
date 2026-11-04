// Enumerações do recurso /pedidos, com os mesmos valores da API.

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
  LOCAL: 'LOCAL',
})

export const ROTULO_MODALIDADE = Object.freeze({
  RETIRADA: 'Retirada Balcão',
  LOCAL: 'Consumo Local',
})

/** Modalidades aceitas no filtro do histórico. */
export const MODALIDADES_FILTRO = Object.freeze([
  { valor: '', rotulo: 'Todas' },
  { valor: MODALIDADE.RETIRADA, rotulo: 'Retirada' },
  { valor: MODALIDADE.LOCAL, rotulo: 'Consumo no local' },
])

export const FORMA_PAGAMENTO = Object.freeze({
  PIX: 'PIX',
  CREDITO: 'CREDITO',
  DEBITO: 'DEBITO',
  DINHEIRO: 'DINHEIRO',
  VOUCHER: 'VOUCHER',
})

export const ROTULO_PAGAMENTO = Object.freeze({
  PIX: 'PIX Instantâneo',
  CREDITO: 'Cartão de Crédito',
  DEBITO: 'Cartão de Débito',
  DINHEIRO: 'Dinheiro',
  VOUCHER: 'Voucher',
})

/** Rótulo curto, usado em "Total (PIX):". */
export const ROTULO_PAGAMENTO_CURTO = Object.freeze({
  PIX: 'PIX',
  CREDITO: 'Crédito',
  DEBITO: 'Débito',
  DINHEIRO: 'Dinheiro',
  VOUCHER: 'Voucher',
})

/** Rótulos da distribuição de pagamentos do dashboard (crédito e débito separados, como na API). */
export const ROTULO_FORMA_DISTRIBUICAO = Object.freeze({
  PIX: 'PIX (Instantâneo)',
  CREDITO: 'Cartão de Crédito',
  DEBITO: 'Cartão de Débito',
  DINHEIRO: 'Dinheiro (Espécie)',
  VOUCHER: 'VR / Refeição / Vouchers',
})

/** Texto exibido no lugar do nome em pedido sem cliente (feito sem identificação no totem). */
export const ROTULO_SEM_CADASTRO = 'Sem cadastro'

/** Listas do quadro de gestão (GET /pedidos/gestao/*), na ordem das colunas. */
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
