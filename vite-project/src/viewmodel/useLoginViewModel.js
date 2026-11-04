import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ehCancelamento } from '../model/api/httpClient.js'
import { MENSAGEM_CAMPOS, MENSAGEM_CREDENCIAIS, ROTA_APOS_LOGIN } from '../model/constants/auth.js'
import { entrar } from '../model/services/authService.js'
import { salvarSessao } from '../model/services/sessaoService.js'

const TITULO_FALHA = 'Login não realizado'

/**
 * Tela de login: campos, validação, envio e redirecionamento.
 * Sucesso → grava a sessão e vai para a Visão Geral. Falha → mensagem na tela, sem sair do login.
 */
export function useLoginViewModel() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null) // { titulo, mensagem } | null
  const [camposInvalidos, setCamposInvalidos] = useState({ email: false, senha: false })
  const controle = useRef(null)

  useEffect(() => () => controle.current?.abort(), [])

  const limparErro = useCallback(() => {
    setErro(null)
    setCamposInvalidos({ email: false, senha: false })
  }, [])

  const alterarEmail = useCallback(
    (valor) => {
      setEmail(valor)
      limparErro()
    },
    [limparErro],
  )

  const alterarSenha = useCallback(
    (valor) => {
      setSenha(valor)
      limparErro()
    },
    [limparErro],
  )

  const alternarSenha = useCallback(() => setMostrarSenha((v) => !v), [])

  const enviar = useCallback(
    async (evento) => {
      evento?.preventDefault()
      if (enviando) return

      const faltaEmail = email.trim() === ''
      const faltaSenha = senha === ''
      if (faltaEmail || faltaSenha) {
        setCamposInvalidos({ email: faltaEmail, senha: faltaSenha })
        setErro({ titulo: 'Preencha os campos', mensagem: MENSAGEM_CAMPOS })
        return
      }

      limparErro()
      setEnviando(true)
      controle.current = new AbortController()
      try {
        const funcionario = await entrar({ email, senha }, controle.current.signal)
        salvarSessao(funcionario)
        navigate(ROTA_APOS_LOGIN, { replace: true })
      } catch (falha) {
        if (ehCancelamento(falha)) return
        setSenha('')
        setCamposInvalidos({ email: falha.status === 401, senha: falha.status === 401 })
        setErro({ titulo: TITULO_FALHA, mensagem: falha.status === 401 ? MENSAGEM_CREDENCIAIS : falha.message })
      } finally {
        setEnviando(false)
      }
    },
    [enviando, email, senha, limparErro, navigate],
  )

  return {
    email,
    senha,
    mostrarSenha,
    enviando,
    erro,
    camposInvalidos,
    alterarEmail,
    alterarSenha,
    alternarSenha,
    enviar,
  }
}
