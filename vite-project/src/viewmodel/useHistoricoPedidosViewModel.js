import { useCallback, useEffect, useState } from 'react'
import { interpretarBusca } from '../model/entities/pedido.js'
import * as historicoService from '../model/services/historicoPedidosService.js'
import { estadoDoBloco, useBloco } from './useBloco.js'

export const TAMANHO_PAGINA_HISTORICO = 10
const DEBOUNCE_BUSCA_MS = 400

const FILTROS_VAZIOS = Object.freeze({ busca: '', dataInicio: '', dataFim: '', modalidade: '' })
const CICLO_ORDENACAO = [null, 'desc', 'asc']

/**
 * ViewModel do Histórico (T2). Qualquer mudança de busca/filtro/ordenação volta para a página 1.
 * A busca tem debounce de 400 ms: dígitos (com # opcional) viram `codigo`; o resto, `cliente`.
 */
export function useHistoricoPedidosViewModel() {
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS)
  const [buscaAplicada, setBuscaAplicada] = useState('')
  const [ordenacao, setOrdenacao] = useState(null) // null | 'desc' | 'asc'
  const [pagina, setPagina] = useState(1)

  // Debounce: só aplica a busca 400 ms depois da última digitação.
  useEffect(() => {
    const texto = filtros.busca.trim()
    if (texto === buscaAplicada) return undefined
    const timer = setTimeout(() => {
      setBuscaAplicada(texto)
      setPagina(1)
    }, DEBOUNCE_BUSCA_MS)
    return () => clearTimeout(timer)
  }, [filtros.busca, buscaAplicada])

  const resultado = useBloco((signal) =>
    historicoService.buscar(
      {
        ...interpretarBusca(buscaAplicada),
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
        modalidade: filtros.modalidade,
        direcao: ordenacao,
        pagina,
        tamanho: TAMANHO_PAGINA_HISTORICO,
      },
      signal,
    ),
  )
  const { carregar } = resultado

  useEffect(() => {
    carregar()
  }, [carregar, buscaAplicada, filtros.dataInicio, filtros.dataFim, filtros.modalidade, ordenacao, pagina])

  const definirBusca = useCallback((texto) => {
    setFiltros((f) => ({ ...f, busca: texto }))
  }, [])

  /** Aplica datas e modalidade do painel de filtros. */
  const aplicarFiltros = useCallback(({ dataInicio = '', dataFim = '', modalidade = '' }) => {
    setFiltros((f) => ({ ...f, dataInicio, dataFim, modalidade }))
    setPagina(1)
  }, [])

  /** Limpa tudo, inclusive a busca. */
  const limparFiltros = useCallback(() => {
    setFiltros(FILTROS_VAZIOS)
    setBuscaAplicada('')
    setPagina(1)
  }, [])

  const alternarOrdenacao = useCallback(() => {
    setOrdenacao((atual) => CICLO_ORDENACAO[(CICLO_ORDENACAO.indexOf(atual) + 1) % CICLO_ORDENACAO.length])
    setPagina(1)
  }, [])

  const totalPaginas = resultado.data?.totalPaginas ?? 1
  const irParaPagina = useCallback(
    (n) => setPagina(Math.min(Math.max(1, n), Math.max(1, totalPaginas))),
    [totalPaginas],
  )

  const filtrosAtivos = [filtros.dataInicio, filtros.dataFim, filtros.modalidade].filter(Boolean).length
  const algumFiltro = filtrosAtivos > 0 || buscaAplicada !== ''

  return {
    filtros,
    filtrosAtivos,
    algumFiltro,
    definirBusca,
    aplicarFiltros,
    limparFiltros,
    ordenacao,
    alternarOrdenacao,
    resultado: estadoDoBloco(resultado),
    pagina,
    irParaPagina,
    atualizar: carregar,
  }
}
