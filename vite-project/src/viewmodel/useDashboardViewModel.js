import { useCallback, useEffect, useMemo, useState } from 'react'
import { PERIODOS, PERIODO_PADRAO, buscarPeriodo } from '../model/constants/periodos.js'
import * as dashboardService from '../model/services/dashboardService.js'
import { estadoDoBloco, useBloco } from './useBloco.js'

export const TAMANHO_PAGINA_TABELA = 4

/**
 * ViewModel da Visão Geral (T1). Cada bloco carrega e falha de forma independente.
 * O `periodo` é enviado em todas as chamadas (nesta sprint, sempre HOJE).
 */
export function useDashboardViewModel(periodoInicial = PERIODO_PADRAO) {
  const [periodo, setPeriodo] = useState(() =>
    buscarPeriodo(periodoInicial).habilitado ? periodoInicial : PERIODO_PADRAO,
  )
  const [paginaTabela, setPaginaTabela] = useState(1)

  const kpis = useBloco((signal) => dashboardService.buscarKpis({ periodo }, signal))
  const tabela = useBloco((signal) =>
    dashboardService.buscarTabela({ periodo, pagina: paginaTabela, tamanho: TAMANHO_PAGINA_TABELA }, signal),
  )

  const { carregar: carregarKpis } = kpis
  const { carregar: carregarTabela } = tabela

  useEffect(() => {
    carregarKpis()
  }, [periodo, carregarKpis])

  // Trocar de página só recarrega a tabela.
  useEffect(() => {
    carregarTabela()
  }, [periodo, paginaTabela, carregarTabela])

  const selecionarPeriodo = useCallback((id) => {
    if (!buscarPeriodo(id).habilitado) return
    setPeriodo(id)
    setPaginaTabela(1)
  }, [])

  const totalPaginasTabela = tabela.data?.totalPaginas ?? 1
  const irParaPagina = useCallback(
    (n) => {
      const destino = Math.min(Math.max(1, n), Math.max(1, totalPaginasTabela))
      setPaginaTabela(destino)
    },
    [totalPaginasTabela],
  )

  const carregadores = useMemo(
    () => ({ kpis: carregarKpis, tabela: carregarTabela }),
    [carregarKpis, carregarTabela],
  )

  const recarregar = useCallback(
    (bloco, opcoes) => {
      if (bloco) return carregadores[bloco]?.(opcoes)
      return Promise.all(Object.values(carregadores).map((c) => c(opcoes)))
    },
    [carregadores],
  )

  return {
    periodos: { lista: PERIODOS, ativo: periodo, info: buscarPeriodo(periodo), selecionar: selecionarPeriodo },
    kpis: estadoDoBloco(kpis),
    tabela: { ...estadoDoBloco(tabela), pagina: paginaTabela, tamanho: TAMANHO_PAGINA_TABELA },
    irParaPagina,
    recarregar,
  }
}
