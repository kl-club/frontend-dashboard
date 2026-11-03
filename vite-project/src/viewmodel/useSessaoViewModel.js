import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROTA_LOGIN } from '../model/constants/auth.js'
import { limparSessao, lerSessao } from '../model/services/sessaoService.js'

/** Estado da sessão do funcionário: quem está logado e como sair. */
export function useSessaoViewModel() {
  const navigate = useNavigate()
  const sessao = lerSessao()

  const sair = useCallback(() => {
    limparSessao()
    navigate(ROTA_LOGIN, { replace: true })
  }, [navigate])

  return { autenticado: Boolean(sessao), usuario: sessao?.usuario ?? null, sair }
}
