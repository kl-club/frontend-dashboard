import { useDashboardViewModel } from '../../../viewmodel/useDashboardViewModel.js'
import KpiGrid from '../../components/KpiGrid/KpiGrid.jsx'
import PeriodoTabs from '../../components/PeriodoTabs/PeriodoTabs.jsx'
import styles from './DashboardPage.module.css'

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
    </div>
  )
}
