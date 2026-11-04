import httpClient from '../api/httpClient.js'

// Dashboard (GET /pedidos/dashboard/*). Todas as chamadas enviam `periodo` (a API só aceita HOJE).

export async function buscarKpis({ periodo }, signal) {
  const { data } = await httpClient.get('/pedidos/dashboard/kpis', { params: { periodo }, signal })
  return data
}

export async function buscarTabela({ periodo, pagina, tamanho }, signal) {
  const { data } = await httpClient.get('/pedidos/dashboard/tabela', { params: { periodo, pagina, tamanho }, signal })
  return data
}

export async function buscarPagamentos({ periodo }, signal) {
  const { data } = await httpClient.get('/pedidos/dashboard/pagamentos', { params: { periodo }, signal })
  return data
}

export async function buscarProdutosMaisVendidos({ periodo }, signal) {
  const { data } = await httpClient.get('/pedidos/dashboard/produtos-mais-vendidos', { params: { periodo }, signal })
  return data
}
