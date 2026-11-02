import { useCallback, useEffect, useState } from 'react'
import { INTERVALO_ATUALIZACAO_MS, LISTAS_GESTAO } from '../model/constants/pedidos.js'
import { buscarConfiguracoes } from '../model/services/configuracoesService.js'
import { buscarLista } from '../model/services/gestaoPedidosService.js'
import { buscarTotal } from '../model/services/historicoPedidosService.js'
import { useBloco } from './useBloco.js'
import { usePolling } from './usePolling.js'

/**
 * Dados do layout: loja (barra superior) e os selos de Pedidos
 * (menu = total do histórico; abas = total de hoje e do histórico).
 */
export function useResumoPedidosViewModel() {
  const loja = useBloco(async (signal) => (await buscarConfiguracoes(signal)).loja ?? null)
  const totalHistorico = useBloco((signal) => buscarTotal(signal))
  const totalHoje = useBloco(async (signal) => {
    const listas = await Promise.all(LISTAS_GESTAO.map((l) => buscarLista(l.chave, signal)))
    return listas.reduce((soma, lista) => soma + lista.length, 0)
  })

  const { carregar: cLoja } = loja
  const { carregar: cHistorico } = totalHistorico
  const { carregar: cHoje, definirDados: definirHoje } = totalHoje
  const [totalHojeInformado, setTotalHojeInformado] = useState(null)

  useEffect(() => {
    cLoja()
    cHistorico()
    cHoje()
  }, [cLoja, cHistorico, cHoje])

  usePolling(
    (signal) => Promise.all([cHistorico({ silencioso: true, signal }), cHoje({ silencioso: true, signal })]),
    INTERVALO_ATUALIZACAO_MS,
  )

  /** O quadro informa a soma das listas quando a tem, para o selo não esperar o próximo ciclo. */
  const informarTotalHoje = useCallback(
    (n) => {
      setTotalHojeInformado(n)
      definirHoje(() => n)
    },
    [definirHoje],
  )

  const recarregar = useCallback(() => Promise.all([cHistorico(), cHoje()]), [cHistorico, cHoje])

  return {
    loja: loja.data,
    totalHistorico: totalHistorico.status === 'success' ? totalHistorico.data : null,
    totalHoje: totalHoje.status === 'success' ? totalHoje.data : totalHojeInformado,
    informarTotalHoje,
    recarregar,
  }
}
