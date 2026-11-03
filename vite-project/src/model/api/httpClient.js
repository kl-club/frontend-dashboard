import axios from 'axios'
import { lerToken } from '../services/sessaoService.js'

export const MENSAGEM_GENERICA = 'Não foi possível concluir a operação. Tente novamente.'
export const MENSAGEM_SEM_CONEXAO = 'Sem conexão com o servidor'

/**
 * Erro de API que preserva o que o ViewModel precisa para decidir (AGENTS.md §3.1):
 * - status: código HTTP (undefined quando não houve resposta = sem conexão)
 * - codigo: campo `codigo` do corpo da resposta, quando existir
 * - message: mensagem amigável (a do corpo ou a genérica)
 * - cancelado: true quando a requisição foi abortada (AbortController)
 */
export class ApiError extends Error {
  constructor({ status, codigo, message, cancelado = false }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.codigo = codigo
    this.cancelado = cancelado
  }
}

export function ehCancelamento(erro) {
  return Boolean(erro?.cancelado) || axios.isCancel(erro) || erro?.name === 'AbortError'
}

export function paraApiError(erro) {
  if (erro instanceof ApiError) return erro
  if (axios.isCancel(erro)) {
    return new ApiError({ status: undefined, message: 'Requisição cancelada', cancelado: true })
  }
  const resposta = erro?.response
  if (!resposta) {
    return new ApiError({ status: undefined, message: MENSAGEM_SEM_CONEXAO })
  }
  const corpo = resposta.data && typeof resposta.data === 'object' ? resposta.data : {}
  return new ApiError({
    status: resposta.status,
    codigo: corpo.codigo,
    message: corpo.mensagem || corpo.message || MENSAGEM_GENERICA,
  })
}

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  timeout: 15_000,
  headers: { Accept: 'application/json' },
})

// Envia o token da sessão (quando houver) em toda requisição.
httpClient.interceptors.request.use((config) => {
  const token = lerToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

httpClient.interceptors.response.use(
  (resposta) => resposta,
  (erro) => Promise.reject(paraApiError(erro)),
)

export default httpClient
