import httpClient from '../api/httpClient.js'

// Configurações estáticas da loja (nome/estado). Não há contrato real nesta sprint
// (AGENTS.md §6.1): vem da coleção `configuracoes` do mock.

export async function buscarConfiguracoes(signal) {
  const { data } = await httpClient.get('/configuracoes', { signal })
  return data ?? {}
}
