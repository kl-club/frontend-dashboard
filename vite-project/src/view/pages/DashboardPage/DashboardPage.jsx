import { useDashboardViewModel } from '../../../viewmodel/useDashboardViewModel.js'
import DistribuicaoPagamentos from '../../components/DistribuicaoPagamentos/DistribuicaoPagamentos.jsx'
import KpiGrid from '../../components/KpiGrid/KpiGrid.jsx'
import PedidosDashboardTable from '../../components/PedidosDashboardTable/PedidosDashboardTable.jsx'
import PeriodoTabs from '../../components/PeriodoTabs/PeriodoTabs.jsx'
import ProdutosMaisVendidos from '../../components/ProdutosMaisVendidos/ProdutosMaisVendidos.jsx'
import styles from './DashboardPage.module.css'

function capitalizar(texto) {
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase() : ''
}

export default function DashboardPage() {
  const vm = useDashboardViewModel()
  const { periodos } = vm

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <h1 className={styles.titulo}>Visão Geral</h1>
        <PeriodoTabs periodos={periodos.lista} ativo={periodos.ativo} onSelecionar={periodos.selecionar} />
      </header>

      <KpiGrid bloco={vm.kpis} rotuloPeriodo={periodos.info.rotuloTitulo} onTentarNovamente={() => vm.recarregar('kpis')} />

      <PedidosDashboardTable
        bloco={vm.tabela}
        pagina={vm.tabela.pagina}
        tamanho={vm.tabela.tamanho}
        onIrParaPagina={vm.irParaPagina}
        onTentarNovamente={() => vm.recarregar('tabela')}
      />

      <div className={styles.ladoALado}>
        <DistribuicaoPagamentos bloco={vm.pagamentos} onTentarNovamente={() => vm.recarregar('pagamentos')} />
        <ProdutosMaisVendidos
          bloco={vm.produtos}
          rotuloFiltro={capitalizar(periodos.info.rotulo)}
          onTentarNovamente={() => vm.recarregar('produtos')}
        />
      </div>
    </div>
  )
}
