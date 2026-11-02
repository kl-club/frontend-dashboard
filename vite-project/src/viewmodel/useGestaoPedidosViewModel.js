import { useCallback, useEffect } from 'react'
import { INTERVALO_ATUALIZACAO_MS } from '../model/constants/pedidos.js'
import * as gestaoService from '../model/services/gestaoPedidosService.js'
import { estadoDoBloco, useBloco } from './useBloco.js'
import { usePolling } from './usePolling.js'

/**
 * ViewModel do quadro "Pedidos de Hoje" (T3): 4 listas buscadas em paralelo,
 * atualizadas a cada 30 s.
 */
export function useGestaoPedidosViewModel() {
  const novos = useBloco((signal) => gestaoService.buscarLista('novos', signal))
  const emPreparo = useBloco((signal) => gestaoService.buscarLista('emPreparo', signal))
  const prontos = useBloco((signal) => gestaoService.buscarLista('prontos', signal))
  const concluidos = useBloco((signal) => gestaoService.buscarLista('concluidos', signal))

  const { carregar: cNovos } = novos
  const { carregar: cPreparo } = emPreparo
  const { carregar: cProntos } = prontos
  const { carregar: cConcluidos } = concluidos

  const carregarTodas = useCallback(
    (opcoes) => Promise.all([cNovos, cPreparo, cProntos, cConcluidos].map((c) => c(opcoes))),
    [cNovos, cPreparo, cProntos, cConcluidos],
  )

  useEffect(() => {
    carregarTodas()
  }, [carregarTodas])

  const polling = usePolling((signal) => carregarTodas({ silencioso: true, signal }), INTERVALO_ATUALIZACAO_MS)
  const { reiniciar } = polling

  /** Botão de atualizar: força a recarga e reinicia a contagem dos 30 s. */
  const atualizar = useCallback(async () => {
    reiniciar({ executar: false })
    await carregarTodas()
  }, [carregarTodas, reiniciar])

  const listas = {
    novos: estadoDoBloco(novos),
    emPreparo: estadoDoBloco(emPreparo),
    prontos: estadoDoBloco(prontos),
    concluidos: estadoDoBloco(concluidos),
  }

  // Selo da aba: soma dos tamanhos das 4 listas (null até todas carregarem).
  const blocos = [novos, emPreparo, prontos, concluidos]
  const totalHoje = blocos.every((b) => b.status === 'success')
    ? blocos.reduce((soma, b) => soma + b.data.length, 0)
    : null

  return {
    listas,
    totalHoje,
    atualizando: blocos.some((b) => b.recarregando),
    intervaloSegundos: INTERVALO_ATUALIZACAO_MS / 1000,
    atualizar,
  }
}
