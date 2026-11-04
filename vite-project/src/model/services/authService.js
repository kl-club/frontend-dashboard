import httpClient from '../api/httpClient.js'

/**
 * Valida o e-mail e a senha do funcionário (POST /funcionarios/login).
 * Resposta 200: { idFuncionario, nome, email, nivel, ativo }. A API não gera token.
 * Credenciais erradas ou funcionário desativado: 401 com `codigo: CREDENCIAIS_INVALIDAS`
 * (vira ApiError no httpClient).
 */
export async function entrar({ email, senha }, signal) {
  const { data } = await httpClient.post('/funcionarios/login', { email: email.trim(), senha }, { signal })
  return data
}
