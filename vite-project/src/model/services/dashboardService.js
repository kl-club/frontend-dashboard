import httpClient from '../api/httpClient.js'

// Dashboard (AGENTS.md §5.1). Todas as chamadas enviam `periodo`.

export async function buscarKpis({ periodo }, signal) {
  const { data } = await httpClient.get('/pedidos/dashboard/kpis', { params: { periodo }, signal })
  return data
}
