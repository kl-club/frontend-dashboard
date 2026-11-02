import { useCallback, useEffect, useRef, useState } from 'react'
import { MENSAGEM_SEM_CONEXAO } from '../model/api/httpClient.js'
import { INTERVALO_ATUALIZACAO_MS, listaDoStatus } from '../model/constants/pedidos.js'
import { formatarCodigo } from '../model/entities/pedido.js'
import * as gestaoService from '../model/services/gestaoPedidosService.js'
import { estadoDoBloco, useBloco } from './useBloco.js'
import { usePolling } from './usePolling.js'

export const MENSAGEM_CONFLITO = 'Este pedido já foi atualizado por outra pessoa. A lista foi atualizada.'

const SUCESSO = {
  aceitar: (id) => `Pedido ${formatarCodigo(id)} aceito e enviado para o preparo.`,
  marcarPronto: (id) => `Pedido ${formatarCodigo(id)} pronto para retirada.`,
  marcarFeito: (id) => `Pedido ${formatarCodigo(id)} concluído.`,
  recusar: (id) => `Pedido ${formatarCodigo(id)} recusado.`,
}

/**
 * ViewModel do quadro "Pedidos de Hoje" (T3): 4 listas buscadas em paralelo,
 * atualizadas a cada 30 s, e as ações de avançar/cancelar.
 * O polling fica pausado enquanto houver uma ação em andamento.
 */
export function useGestaoPedidosViewModel() {
  const novos = useBloco((signal) => gestaoService.buscarLista('novos', signal))
  const emPreparo = useBloco((signal) => gestaoService.buscarLista('emPreparo', signal))
  const prontos = useBloco((signal) => gestaoService.buscarLista('prontos', signal))
  const concluidos = useBloco((signal) => gestaoService.buscarLista('concluidos', signal))

  const [acao, setAcao] = useState(null) // { id, tipo } | null
  const [aviso, setAviso] = useState(null) // { tipo: 'sucesso' | 'erro', mensagem, chave } | null
  const acaoRef = useRef(null)

  const { carregar: cNovos, definirDados: dNovos } = novos
  const { carregar: cPreparo, definirDados: dPreparo } = emPreparo
  const { carregar: cProntos, definirDados: dProntos } = prontos
  const { carregar: cConcluidos, definirDados: dConcluidos } = concluidos

  const carregarTodas = useCallback(
    (opcoes) => Promise.all([cNovos, cPreparo, cProntos, cConcluidos].map((c) => c(opcoes))),
    [cNovos, cPreparo, cProntos, cConcluidos],
  )

  const recarregarLista = useCallback(
    (chave) => ({ novos: cNovos, emPreparo: cPreparo, prontos: cProntos, concluidos: cConcluidos })[chave]?.(),
    [cNovos, cPreparo, cProntos, cConcluidos],
  )

  useEffect(() => {
    carregarTodas()
  }, [carregarTodas])

  const { reiniciar } = usePolling(
    (signal) => carregarTodas({ silencioso: true, signal }),
    INTERVALO_ATUALIZACAO_MS,
    { ativo: acao === null },
  )

  /** Botão de atualizar: força a recarga e reinicia a contagem dos 30 s. */
  const atualizar = useCallback(async () => {
    reiniciar({ executar: false })
    await carregarTodas()
  }, [carregarTodas, reiniciar])

  /** Tira o pedido da coluna de origem e o coloca no fim da fila da coluna de destino. */
  const mover = useCallback(
    (id, atualizado) => {
      const definidores = { novos: dNovos, emPreparo: dPreparo, prontos: dProntos, concluidos: dConcluidos }
      const destino = listaDoStatus(atualizado?.status)
      for (const [chave, definir] of Object.entries(definidores)) {
        definir((lista) => {
          const semPedido = (lista ?? []).filter((p) => p.id !== id)
          return chave === destino ? [...semPedido, atualizado] : semPedido
        })
      }
    },
    [dNovos, dPreparo, dProntos, dConcluidos],
  )

  const executar = useCallback(
    async (tipo, id, operacao) => {
      if (acaoRef.current) return false
      acaoRef.current = { id, tipo }
      setAcao({ id, tipo })
      try {
        const atualizado = await operacao(id)
        if (atualizado && typeof atualizado === 'object') mover(id, atualizado)
        else await carregarTodas({ silencioso: true })
        setAviso({ tipo: 'sucesso', mensagem: SUCESSO[tipo](id), chave: Date.now() })
        return true
      } catch (erro) {
        if (erro?.status === 409 || erro?.status === 404) {
          setAviso({ tipo: 'erro', mensagem: MENSAGEM_CONFLITO, chave: Date.now() })
          await carregarTodas()
        } else if (erro?.status === undefined) {
          // Sem conexão: o cartão permanece onde está.
          setAviso({ tipo: 'erro', mensagem: MENSAGEM_SEM_CONEXAO, chave: Date.now() })
        } else {
          setAviso({ tipo: 'erro', mensagem: erro.message, chave: Date.now() })
        }
        return false
      } finally {
        acaoRef.current = null
        setAcao(null)
      }
    },
    [mover, carregarTodas],
  )

  const aceitar = useCallback((id) => executar('aceitar', id, gestaoService.avancar), [executar])
  const marcarPronto = useCallback((id) => executar('marcarPronto', id, gestaoService.avancar), [executar])
  const marcarFeito = useCallback((id) => executar('marcarFeito', id, gestaoService.avancar), [executar])
  /** A confirmação ("Recusar o pedido…?") é responsabilidade da View. */
  const recusar = useCallback((id) => executar('recusar', id, gestaoService.cancelar), [executar])
  const fecharAviso = useCallback(() => setAviso(null), [])

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
    acaoEmAndamento: acao?.id ?? null,
    tipoAcaoEmAndamento: acao?.tipo ?? null,
    aceitar,
    marcarPronto,
    marcarFeito,
    recusar,
    atualizar,
    recarregarLista,
    atualizando: blocos.some((b) => b.recarregando),
    intervaloSegundos: INTERVALO_ATUALIZACAO_MS / 1000,
    aviso,
    fecharAviso,
  }
}
