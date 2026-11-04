import { useCallback, useEffect, useState } from 'react'
import { INTERVALO_ATUALIZACAO_MS, LISTAS_GESTAO } from '../model/constants/pedidos.js'
import { buscarLista } from '../model/services/gestaoPedidosService.js'
import { buscarTotal } from '../model/services/historicoPedidosService.js'
import { useBloco } from './useBloco.js'
import { usePolling } from './usePolling.js'

/** Listas do quadro que ainda pedem ação (todas menos Concluídos). */
const LISTAS_EM_ANDAMENTO = LISTAS_GESTAO.filter((l) => l.chave !== 'concluidos').map((l) => l.chave)

/** Contagens de hoje a partir das listas da gestão: `{ total, emAndamento }`. */
export function contarHoje(tamanhos) {
  const total = Object.values(tamanhos).reduce((soma, n) => soma + n, 0)
  const emAndamento = LISTAS_EM_ANDAMENTO.reduce((soma, chave) => soma + (tamanhos[chave] ?? 0), 0)
  return { total, emAndamento }
}

/**
 * Dados do layout: os selos de Pedidos.
 * - menu: pedidos de hoje ainda não concluídos (Novos + Em Preparo + Prontos);
 * - aba Pedidos de Hoje: soma das 4 listas; aba Histórico: total do histórico.
 */
export function useResumoPedidosViewModel() {
  const totalHistorico = useBloco((signal) => buscarTotal(signal))
  const hoje = useBloco(async (signal) => {
    const listas = await Promise.all(LISTAS_GESTAO.map((l) => buscarLista(l.chave, signal)))
    return contarHoje(Object.fromEntries(LISTAS_GESTAO.map((l, i) => [l.chave, listas[i].length])))
  })

  const { carregar: cHistorico } = totalHistorico
  const { carregar: cHoje, definirDados: definirHoje } = hoje
  const [hojeInformado, setHojeInformado] = useState(null)

  useEffect(() => {
    cHistorico()
    cHoje()
  }, [cHistorico, cHoje])

  usePolling(
    (signal) => Promise.all([cHistorico({ silencioso: true, signal }), cHoje({ silencioso: true, signal })]),
    INTERVALO_ATUALIZACAO_MS,
  )

  /** O quadro informa as contagens `{ total, emAndamento }` quando as tem, para os selos não esperarem o próximo ciclo. */
  const informarHoje = useCallback(
    (contagens) => {
      setHojeInformado(contagens)
      definirHoje(() => contagens)
    },
    [definirHoje],
  )

  const recarregar = useCallback(() => Promise.all([cHistorico(), cHoje()]), [cHistorico, cHoje])
  const contagensHoje = hoje.status === 'success' ? hoje.data : hojeInformado

  return {
    totalHistorico: totalHistorico.status === 'success' ? totalHistorico.data : null,
    totalHoje: contagensHoje?.total ?? null,
    emAndamentoHoje: contagensHoje?.emAndamento ?? null,
    informarHoje,
    recarregar,
  }
}
