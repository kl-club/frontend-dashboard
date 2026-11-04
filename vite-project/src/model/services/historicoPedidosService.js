import httpClient from '../api/httpClient.js'

// Histórico de pedidos (GET /pedidos/historico). Devolve o envelope de paginação
// { conteudo, pagina, tamanho, total, totalPaginas }.

/**
 * @param {object} filtros
 * @param {string|number} [filtros.idPedido] busca exata pelo código
 * @param {string} [filtros.nomeUsuario] busca parcial pelo nome do cliente
 * @param {string} [filtros.dataInicio] AAAA-MM-DD
 * @param {string} [filtros.dataFim] AAAA-MM-DD
 * @param {string} [filtros.modalidade] RETIRADA | LOCAL
 * @param {'asc'|'desc'|null} [filtros.direcao] ordenação por valor; null = mais recentes primeiro
 * @param {number} filtros.pagina
 * @param {number} filtros.tamanho
 */
export async function buscar({ idPedido, nomeUsuario, dataInicio, dataFim, modalidade, direcao, pagina, tamanho }, signal) {
  const params = { pagina, tamanho }
  if (idPedido != null && idPedido !== '') params.idPedido = idPedido
  if (nomeUsuario) params.nomeUsuario = nomeUsuario
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
