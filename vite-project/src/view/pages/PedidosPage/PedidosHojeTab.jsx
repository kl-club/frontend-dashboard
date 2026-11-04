import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { STATUS } from '../../../model/constants/pedidos.js'
import { formatarCodigo, formatarMoeda } from '../../../model/entities/pedido.js'
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
  const informarHoje = useOutletContext()?.resumo?.informarHoje
  const [aRecusar, setARecusar] = useState(null) // idPedido | null
  const [aReceber, setAReceber] = useState(null) // { idPedido, valorTotal } | null

  // Os selos (aba e menu) usam as contagens do quadro assim que ele carrega ou muda.
  useEffect(() => {
    if (vm.totalHoje != null) informarHoje?.({ total: vm.totalHoje, emAndamento: vm.emAndamentoHoje })
  }, [vm.totalHoje, vm.emAndamentoHoje, informarHoje])

  const ocupado = vm.acaoEmAndamento !== null

  function renderAcoes(lista, pedido) {
    const id = pedido.idPedido
    const esteCartao = vm.acaoEmAndamento === id
    const carregando = (tipo) => esteCartao && vm.tipoAcaoEmAndamento === tipo
    const desabilitado = ocupado && !esteCartao
    const codigo = formatarCodigo(id)

    switch (lista) {
      case 'novos': {
        // PENDENTE = pagamento em dinheiro no balcão: aceitar significa receber o pagamento.
        const pendente = pedido.statusPedido === STATUS.PENDENTE
        return (
          <>
            <BotaoAcao
              variante="perigo"
              carregando={carregando('recusar')}
              desabilitado={desabilitado || esteCartao}
              onClick={() => setARecusar(id)}
              aria-label={`Recusar pedido ${codigo}`}
            >
              Recusar
            </BotaoAcao>
            {pendente ? (
              <BotaoAcao
                carregando={carregando('receber')}
                desabilitado={desabilitado || esteCartao}
                onClick={() => setAReceber({ idPedido: id, valorTotal: pedido.valorTotal })}
                aria-label={`Receber o pagamento e aceitar o pedido ${codigo}`}
              >
                Receber e aceitar
              </BotaoAcao>
            ) : (
              <BotaoAcao
                carregando={carregando('aceitar')}
                desabilitado={desabilitado || esteCartao}
                onClick={() => vm.aceitar(id)}
                aria-label={`Aceitar pedido ${codigo}`}
              >
                Aceitar
              </BotaoAcao>
            )}
          </>
        )
      }
      case 'emPreparo':
        return (
          <BotaoAcao
            variante="primario"
            carregando={esteCartao}
            desabilitado={desabilitado}
            onClick={() => vm.marcarPronto(id)}
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
            onClick={() => vm.marcarFeito(id)}
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

  function confirmarRecebimento() {
    const pedido = aReceber
    setAReceber(null)
    if (pedido != null) vm.receber(pedido.idPedido)
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

      <DialogoConfirmacao
        aberto={aReceber !== null}
        titulo="Receber pagamento"
        mensagem={
          aReceber !== null
            ? `Confirmar o recebimento de ${formatarMoeda(aReceber.valorTotal)} do pedido ${formatarCodigo(aReceber.idPedido)}?`
            : ''
        }
        rotuloConfirmar="Confirmar recebimento"
        rotuloCancelar="Voltar"
        onConfirmar={confirmarRecebimento}
        onCancelar={() => setAReceber(null)}
      />

      <Aviso aviso={vm.aviso} onFechar={vm.fecharAviso} />
    </section>
  )
}
