import { useCallback, useEffect, useRef, useState } from 'react'
import { ehCancelamento } from '../model/api/httpClient.js'

const INICIAL = Object.freeze({ status: 'loading', data: null, error: null, recarregando: false })

/**
 * Um bloco de dados `{ status, data, error }` com status em loading | success | error
 * (AGENTS.md §8). `recarregando` indica uma recarga com dados antigos ainda na tela.
 *
 * - `carregar()` mostra carregamento (esqueleto) se ainda não há dados;
 * - `carregar({ silencioso: true })` é a recarga automática: mantém os dados antigos
 *   sem piscar e, se falhar, não troca os dados por erro;
 * - cada nova carga cancela a anterior; desmontar cancela a pendente.
 *
 * `buscar(signal)` deve devolver uma Promise com os dados.
 */
export function useBloco(buscar) {
  const [estado, setEstado] = useState(INICIAL)
  const buscarRef = useRef(buscar)
  const controleRef = useRef(null)

  useEffect(() => {
    buscarRef.current = buscar
  })

  useEffect(
    () => () => {
      controleRef.current?.abort()
    },
    [],
  )

  const carregar = useCallback(async ({ silencioso = false, signal } = {}) => {
    controleRef.current?.abort()
    const controle = new AbortController()
    controleRef.current = controle
    const abortarExterno = () => controle.abort()
    signal?.addEventListener('abort', abortarExterno, { once: true })

    setEstado((s) => {
      if (s.status === 'success') return silencioso ? s : { ...s, recarregando: true }
      if (silencioso && s.status === 'error') return s
      return INICIAL
    })

    try {
      const data = await buscarRef.current(controle.signal)
      if (controle.signal.aborted) return undefined
      setEstado({ status: 'success', data, error: null, recarregando: false })
      return data
    } catch (erro) {
      if (controle.signal.aborted || ehCancelamento(erro)) return undefined
      setEstado((s) =>
        silencioso && s.status === 'success'
          ? { ...s, recarregando: false }
          : { status: 'error', data: null, error: erro, recarregando: false },
      )
      return undefined
    } finally {
      signal?.removeEventListener('abort', abortarExterno)
      if (controleRef.current === controle) controleRef.current = null
    }
  }, [])

  /** Atualiza os dados localmente (ex.: mover um cartão no quadro sem nova requisição). */
  const definirDados = useCallback((atualizar) => {
    setEstado((s) => (s.status === 'success' ? { ...s, data: atualizar(s.data) } : s))
  }, [])

  return { ...estado, carregar, definirDados }
}

/** Só o formato público do bloco: `{ status, data, error, recarregando }`. */
export function estadoDoBloco({ status, data, error, recarregando }) {
  return { status, data, error, recarregando }
}
