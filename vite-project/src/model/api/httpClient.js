import axios from 'axios'

export const MENSAGEM_GENERICA = 'Não foi possível concluir a operação. Tente novamente.'
export const MENSAGEM_SEM_CONEXAO = 'Sem conexão com o servidor'

/**
 * Erro de API que preserva o que o ViewModel precisa para decidir:
 * - status: código HTTP (undefined quando não houve resposta = sem conexão)
 * - codigo: propriedade `codigo` do ProblemDetail, quando existir
 * - message: o `detail` do ProblemDetail ou, se ele vier vazio, a mensagem genérica
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

function textoOuNulo(valor) {
  return typeof valor === 'string' && valor.trim() !== '' ? valor.trim() : null
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
    message: textoOuNulo(corpo.detail) ?? MENSAGEM_GENERICA,
  })
}

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  timeout: 15_000,
  headers: { Accept: 'application/json' },
})

httpClient.interceptors.response.use(
  (resposta) => resposta,
  (erro) => Promise.reject(paraApiError(erro)),
)

export default httpClient
