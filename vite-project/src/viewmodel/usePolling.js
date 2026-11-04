import { useCallback, useEffect, useRef, useState } from 'react'

function paginaVisivel() {
  return typeof document === 'undefined' || document.visibilityState !== 'hidden'
}

/**
 * Chama `funcao(signal)` a cada `intervaloMs`:
 * - a próxima chamada só é agendada depois que a anterior termina (sem sobreposição);
 * - pausa quando `ativo` é false ou quando a aba do navegador está oculta;
 *   ao voltar a ficar visível, atualiza na hora;
 * - ao desmontar (ou pausar), aborta a requisição pendente via AbortController.
 *
 * Não faz a carga inicial: quem usa carrega os dados ao montar.
 * `reiniciar({ executar })` reinicia a contagem e, por padrão, executa já.
 */
export function usePolling(funcao, intervaloMs, { ativo = true } = {}) {
  const funcaoRef = useRef(funcao)
  const executarJaRef = useRef(false)
  const [visivel, setVisivel] = useState(paginaVisivel)
  const [ciclo, setCiclo] = useState(0)

  useEffect(() => {
    funcaoRef.current = funcao
  })

  useEffect(() => {
    const aoMudar = () => setVisivel(paginaVisivel())
    document.addEventListener('visibilitychange', aoMudar)
    return () => document.removeEventListener('visibilitychange', aoMudar)
  }, [])

  useEffect(() => {
    if (!visivel) {
      executarJaRef.current = true
      return undefined
    }
    if (!ativo) return undefined

    let encerrado = false
    let timer = null
    let controle = null

    const executar = async () => {
      controle = new AbortController()
      try {
        await funcaoRef.current(controle.signal)
      } catch {
        // Erros ficam a cargo de quem usa (o bloco mostra o próprio erro).
      } finally {
        controle = null
      }
    }

    const agendar = () => {
      timer = setTimeout(async () => {
        await executar()
        if (!encerrado) agendar()
      }, intervaloMs)
    }

    if (executarJaRef.current) {
      executarJaRef.current = false
      executar().then(() => {
        if (!encerrado) agendar()
      })
    } else {
      agendar()
    }

    return () => {
      encerrado = true
      clearTimeout(timer)
      controle?.abort()
    }
  }, [ativo, visivel, intervaloMs, ciclo])

  const reiniciar = useCallback(({ executar = true } = {}) => {
    executarJaRef.current = executar
    setCiclo((c) => c + 1)
  }, [])

  return { reiniciar, pausado: !ativo || !visivel }
}
