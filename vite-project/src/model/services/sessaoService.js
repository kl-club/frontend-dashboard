// Sessão do funcionário. Fica em sessionStorage (encerra ao fechar a aba) e cai para a memória
// quando o storage não está disponível (modo privado, bloqueio de dados do site).
// A API não gera token: a sessão só guarda o funcionário devolvido pelo login, e a proteção
// das telas é feita pelo front (RotaProtegida).

const CHAVE = 'klclub.sessao'
let emMemoria = null

function valida(sessao) {
  const funcionario = sessao?.funcionario
  return Boolean(funcionario) && typeof funcionario === 'object' && funcionario.idFuncionario != null
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

/** Grava a sessão a partir da resposta do login: { idFuncionario, nome, email, nivel, ativo }. */
export function salvarSessao(funcionario) {
  const sessao = { funcionario }
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
