import httpClient from '../api/httpClient.js'
import { LISTAS_GESTAO } from '../constants/pedidos.js'

// Gestão de pedidos de hoje (GET /pedidos/gestao/*, PATCH /pedidos/{id}/avancar e /cancelar).

/** Lista do quadro pela chave (`novos`, `emPreparo`, `prontos`, `concluidos`). Array de Pedido. */
export async function buscarLista(chave, signal) {
  const lista = LISTAS_GESTAO.find((l) => l.chave === chave)
  if (!lista) throw new Error(`Lista desconhecida: ${chave}`)
  const { data } = await httpClient.get(`/pedidos/gestao/${lista.rota}`, { signal })
  return Array.isArray(data) ? data : []
}

/** PATCH sem corpo: o back-end decide o próximo status. Devolve o Pedido atualizado. */
export async function avancar(id) {
  const { data } = await httpClient.patch(`/pedidos/${id}/avancar`)
  return data
}

/** PATCH sem corpo: só a partir de PENDENTE ou PAGO. Devolve o Pedido atualizado. */
export async function cancelar(id) {
  const { data } = await httpClient.patch(`/pedidos/${id}/cancelar`)
  return data
}
