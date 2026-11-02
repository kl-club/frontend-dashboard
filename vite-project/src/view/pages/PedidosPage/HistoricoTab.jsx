import { useState } from 'react'
import { useHistoricoPedidosViewModel, TAMANHO_PAGINA_HISTORICO } from '../../../viewmodel/useHistoricoPedidosViewModel.js'
import BotaoAtualizar from '../../components/BotaoAtualizar/BotaoAtualizar.jsx'
import CampoBusca from '../../components/CampoBusca/CampoBusca.jsx'
import HistoricoTable from '../../components/HistoricoTable/HistoricoTable.jsx'
import Icone from '../../components/Icone/Icone.jsx'
import PainelFiltros from '../../components/PainelFiltros/PainelFiltros.jsx'
import styles from './PedidosPage.module.css'

const ID_PAINEL = 'painel-filtros-historico'

export default function HistoricoTab() {
  const vm = useHistoricoPedidosViewModel()
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)

  return (
    <section className={styles.conteudoAba} aria-label="Histórico de pedidos">
      <div className={styles.barraFerramentas}>
        <CampoBusca
          valor={vm.filtros.busca}
          onMudar={vm.definirBusca}
          placeholder="Buscar por cliente ou nº do pedido"
        />
        <div className={styles.grupoBotoes}>
          <button
            type="button"
            className={`${styles.botaoFerramenta} ${filtrosAbertos ? styles.botaoAtivo : ''}`}
            aria-expanded={filtrosAbertos}
            aria-controls={ID_PAINEL}
            onClick={() => setFiltrosAbertos((v) => !v)}
          >
            <Icone nome="filtro" tamanho={16} />
            Filtrar
            {vm.filtrosAtivos > 0 && (
              <span className={`${styles.contadorFiltros} tabular`} aria-label={`${vm.filtrosAtivos} filtros ativos`}>
                {vm.filtrosAtivos}
              </span>
            )}
          </button>
          <button type="button" className={styles.botaoFerramenta} disabled title="Disponível em uma próxima sprint">
            <Icone nome="exportar" tamanho={16} />
            Exportar
          </button>
          <BotaoAtualizar onClick={() => vm.atualizar()} carregando={vm.resultado.recarregando} />
        </div>
      </div>

      {filtrosAbertos && (
        <PainelFiltros
          id={ID_PAINEL}
          valores={vm.filtros}
          onAplicar={vm.aplicarFiltros}
          onFechar={() => setFiltrosAbertos(false)}
        />
      )}

      <HistoricoTable
        bloco={vm.resultado}
        tamanho={TAMANHO_PAGINA_HISTORICO}
        ordenacao={vm.ordenacao}
        onAlternarOrdenacao={vm.alternarOrdenacao}
        onIrParaPagina={vm.irParaPagina}
        onTentarNovamente={() => vm.atualizar()}
        onLimparFiltros={vm.algumFiltro ? vm.limparFiltros : undefined}
      />
    </section>
  )
}
