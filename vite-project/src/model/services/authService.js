import httpClient from '../api/httpClient.js'

/**
 * Autentica o funcionário. `usuario` aceita o nome de usuário ou o e-mail.
 * Resposta 200: { token, usuario: { id, nome, perfil } }.
 * Credenciais erradas: 401 com `codigo: CREDENCIAIS_INVALIDAS` (vira ApiError no httpClient).
 */
export async function entrar({ usuario, senha }, signal) {
  const { data } = await httpClient.post('/auth/login', { usuario: usuario.trim(), senha }, { signal })
  return data
}
