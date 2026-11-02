import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { formatarCodigo } from '../../../model/entities/pedido.js'
import { useGestaoPedidosViewModel } from '../../../viewmodel/useGestaoPedidosViewModel.js'
import Aviso from '../../components/Aviso/Aviso.jsx'
import BotaoAcao from '../../components/BotaoAcao/BotaoAcao.jsx'
import BotaoAtualizar from '../../components/BotaoAtualizar/BotaoAtualizar.jsx'
import Chip from '../../components/Chip/Chip.jsx'
import DialogoConfirmacao from '../../components/DialogoConfirmacao/DialogoConfirmacao.jsx'
import QuadroPedidos from '../../components/QuadroPedidos/QuadroPedidos.jsx'
import styles from './PedidosPage.module.css'

export default function PedidosHojeTab() {
  const vm = useGestaoPedidosViewModel()
  const informarTotalHoje = useOutletContext()?.resumo?.informarTotalHoje
  const [aRecusar, setARecusar] = useState(null)

  // O selo da aba usa a soma das listas assim que o quadro carrega.
  useEffect(() => {
    if (vm.totalHoje != null) informarTotalHoje?.(vm.totalHoje)
  }, [vm.totalHoje, informarTotalHoje])

  const ocupado = vm.acaoEmAndamento !== null

  function renderAcoes(lista, pedido) {
    const esteCartao = vm.acaoEmAndamento === pedido.id
    const carregando = (tipo) => esteCartao && vm.tipoAcaoEmAndamento === tipo
    const desabilitado = ocupado && !esteCartao
    const codigo = formatarCodigo(pedido.id)

    switch (lista) {
      case 'novos':
        return (
          <>
            <BotaoAcao
              variante="perigo"
              carregando={carregando('recusar')}
              desabilitado={desabilitado || esteCartao}
              onClick={() => setARecusar(pedido.id)}
              aria-label={`Recusar pedido ${codigo}`}
            >
              Recusar
            </BotaoAcao>
            <BotaoAcao
              carregando={carregando('aceitar')}
              desabilitado={desabilitado || esteCartao}
              onClick={() => vm.aceitar(pedido.id)}
              aria-label={`Aceitar pedido ${codigo}`}
            >
              Aceitar
            </BotaoAcao>
          </>
        )
      case 'emPreparo':
        return (
          <BotaoAcao
            variante="primario"
            carregando={esteCartao}
            desabilitado={desabilitado}
            onClick={() => vm.marcarPronto(pedido.id)}
            aria-label={`Marcar pedido ${codigo} como pronto`}
          >
            Marcar como Pronto
          </BotaoAcao>
        )
      case 'prontos':
        return (
          <BotaoAcao
            variante="primario"
            carregando={esteCartao}
            desabilitado={desabilitado}
            onClick={() => vm.marcarFeito(pedido.id)}
            aria-label={`Marcar pedido ${codigo} como feito`}
          >
            Marcar como Feito
          </BotaoAcao>
        )
      default:
        return null // Concluídos não têm ações.
    }
  }

  function confirmarRecusa() {
    const id = aRecusar
    setARecusar(null)
    if (id != null) vm.recusar(id)
  }

  return (
    <section className={styles.conteudoAba} aria-label="Pedidos de hoje">
      <div className={styles.barraFerramentas}>
        <Chip tom="auto" title={ocupado ? 'Atualização automática pausada durante a ação' : 'Atualização automática'}>
          Auto: {vm.intervaloSegundos}s
        </Chip>
        <BotaoAtualizar onClick={vm.atualizar} carregando={vm.atualizando} desabilitado={ocupado} />
      </div>

      <QuadroPedidos
        listas={vm.listas}
        renderAcoes={renderAcoes}
        acaoEmAndamento={vm.acaoEmAndamento}
        onTentarNovamente={vm.recarregarLista}
      />

      <DialogoConfirmacao
        aberto={aRecusar !== null}
        titulo="Recusar pedido"
        mensagem={aRecusar !== null ? `Recusar o pedido ${formatarCodigo(aRecusar)}? Ele será cancelado e não gerará pontos.` : ''}
        rotuloConfirmar="Recusar pedido"
        rotuloCancelar="Voltar"
        perigo
        onConfirmar={confirmarRecusa}
        onCancelar={() => setARecusar(null)}
      />

      <Aviso aviso={vm.aviso} onFechar={vm.fecharAviso} />
    </section>
  )
}
