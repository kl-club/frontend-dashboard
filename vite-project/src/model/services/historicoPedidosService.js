import httpClient from '../api/httpClient.js'

// Histórico de pedidos (AGENTS.md §5.3). Devolve o envelope de paginação.

/**
 * @param {object} filtros
 * @param {number} [filtros.codigo]
 * @param {string} [filtros.cliente]
 * @param {string} [filtros.dataInicio] AAAA-MM-DD
 * @param {string} [filtros.dataFim] AAAA-MM-DD
 * @param {string} [filtros.modalidade] RETIRADA | CONSUMO_LOCAL
 * @param {'asc'|'desc'|null} [filtros.direcao] ordenação por valor; null = mais recentes primeiro
 * @param {number} filtros.pagina
 * @param {number} filtros.tamanho
 */
export async function buscar({ codigo, cliente, dataInicio, dataFim, modalidade, direcao, pagina, tamanho }, signal) {
  const params = { pagina, tamanho }
  if (codigo != null) params.codigo = codigo
  if (cliente) params.cliente = cliente
  if (dataInicio) params.dataInicio = dataInicio
  if (dataFim) params.dataFim = dataFim
  if (modalidade) params.modalidade = modalidade
  if (direcao) {
    params.ordenarPor = 'valor'
    params.direcao = direcao
  }
  const { data } = await httpClient.get('/pedidos/historico', { params, signal })
  return data
}

/** Só o total do histórico (selo do menu e da aba). */
export async function buscarTotal(signal) {
  const { data } = await httpClient.get('/pedidos/historico', { params: { pagina: 1, tamanho: 1 }, signal })
  return data?.total ?? 0
}
