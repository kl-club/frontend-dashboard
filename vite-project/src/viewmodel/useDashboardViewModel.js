import { useCallback, useEffect, useMemo, useState } from 'react'
import { PERIODOS, PERIODO_PADRAO, buscarPeriodo } from '../model/constants/periodos.js'
import * as dashboardService from '../model/services/dashboardService.js'
import { estadoDoBloco, useBloco } from './useBloco.js'

/**
 * ViewModel da Visão Geral (T1). Cada bloco carrega e falha de forma independente.
 * O `periodo` é enviado em todas as chamadas (nesta sprint, sempre HOJE).
 */
export function useDashboardViewModel(periodoInicial = PERIODO_PADRAO) {
  const [periodo, setPeriodo] = useState(() =>
    buscarPeriodo(periodoInicial).habilitado ? periodoInicial : PERIODO_PADRAO,
  )

  const kpis = useBloco((signal) => dashboardService.buscarKpis({ periodo }, signal))
  const { carregar: carregarKpis } = kpis

  useEffect(() => {
    carregarKpis()
  }, [periodo, carregarKpis])

  const selecionarPeriodo = useCallback((id) => {
    if (buscarPeriodo(id).habilitado) setPeriodo(id)
  }, [])

  const carregadores = useMemo(() => ({ kpis: carregarKpis }), [carregarKpis])

  const recarregar = useCallback(
    (bloco) => {
      if (bloco) return carregadores[bloco]?.()
      return Promise.all(Object.values(carregadores).map((c) => c()))
    },
    [carregadores],
  )

  return {
    periodos: { lista: PERIODOS, ativo: periodo, info: buscarPeriodo(periodo), selecionar: selecionarPeriodo },
    kpis: estadoDoBloco(kpis),
    recarregar,
  }
}
