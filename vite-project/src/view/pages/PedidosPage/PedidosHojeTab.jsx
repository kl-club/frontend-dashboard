import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useGestaoPedidosViewModel } from '../../../viewmodel/useGestaoPedidosViewModel.js'
import BotaoAtualizar from '../../components/BotaoAtualizar/BotaoAtualizar.jsx'
import Chip from '../../components/Chip/Chip.jsx'
import QuadroPedidos from '../../components/QuadroPedidos/QuadroPedidos.jsx'
import styles from './PedidosPage.module.css'

export default function PedidosHojeTab() {
  const vm = useGestaoPedidosViewModel()
  const informarTotalHoje = useOutletContext()?.resumo?.informarTotalHoje

  // O selo da aba usa a soma das listas assim que o quadro carrega.
  useEffect(() => {
    if (vm.totalHoje != null) informarTotalHoje?.(vm.totalHoje)
  }, [vm.totalHoje, informarTotalHoje])

  return (
    <section className={styles.conteudoAba} aria-label="Pedidos de hoje">
      <div className={styles.barraFerramentas}>
        <Chip tom="ao-vivo" title="Atualização automática">
          Auto: {vm.intervaloSegundos}s
        </Chip>
        <BotaoAtualizar onClick={vm.atualizar} carregando={vm.atualizando} />
      </div>

      <QuadroPedidos listas={vm.listas} onTentarNovamente={vm.atualizar} />
    </section>
  )
}
