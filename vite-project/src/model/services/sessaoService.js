// Sessão do funcionário. Fica em sessionStorage (encerra ao fechar a aba) e cai para a memória
// quando o storage não está disponível (modo privado, bloqueio de dados do site).

const CHAVE = 'klclub.sessao'
let emMemoria = null

function valida(sessao) {
  return Boolean(sessao) && typeof sessao.token === 'string' && sessao.token !== '' && typeof sessao.usuario === 'object'
}

export function lerSessao() {
  try {
    const bruto = window.sessionStorage.getItem(CHAVE)
    if (bruto) {
      const sessao = JSON.parse(bruto)
      return valida(sessao) ? sessao : null
    }
  } catch {
    // storage indisponível ou conteúdo inválido: usa a memória
  }
  return valida(emMemoria) ? emMemoria : null
}

export function salvarSessao(sessao) {
  emMemoria = sessao
  try {
    window.sessionStorage.setItem(CHAVE, JSON.stringify(sessao))
  } catch {
    // segue só em memória
  }
}

export function limparSessao() {
  emMemoria = null
  try {
    window.sessionStorage.removeItem(CHAVE)
  } catch {
    // nada a limpar
  }
}

export function lerToken() {
  return lerSessao()?.token ?? null
}
