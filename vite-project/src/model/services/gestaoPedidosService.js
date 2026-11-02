import httpClient from '../api/httpClient.js'
import { LISTAS_GESTAO } from '../constants/pedidos.js'

// Gestão de pedidos de hoje (AGENTS.md §5.2).

/** Lista do quadro pela chave (`novos`, `emPreparo`, `prontos`, `concluidos`). Array de Pedido. */
export async function buscarLista(chave, signal) {
  const lista = LISTAS_GESTAO.find((l) => l.chave === chave)
  if (!lista) throw new Error(`Lista desconhecida: ${chave}`)
  const { data } = await httpClient.get(`/pedidos/gestao/${lista.rota}`, { signal })
  return Array.isArray(data) ? data : []
}
