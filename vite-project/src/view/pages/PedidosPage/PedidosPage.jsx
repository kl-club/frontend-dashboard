import { Link, Outlet, useMatch, useOutletContext, useResolvedPath } from 'react-router-dom'
import Icone from '../../components/Icone/Icone.jsx'
import styles from './PedidosPage.module.css'

const ABAS = [
  { para: 'hoje', rotulo: 'Pedidos de Hoje', chave: 'totalHoje' },
  { para: 'historico', rotulo: 'Histórico de Pedidos', chave: 'totalHistorico' },
]

function Aba({ para, rotulo, selo }) {
  const caminho = useResolvedPath(para)
  const ativa = Boolean(useMatch({ path: caminho.pathname, end: true }))
  return (
    <Link
      to={para}
      role="tab"
      aria-selected={ativa}
      aria-current={ativa ? 'page' : undefined}
      className={`${styles.aba} ${ativa ? styles.abaAtiva : ''}`}
    >
      {rotulo}
      {selo != null && <span className={`${styles.selo} tabular`}>{selo}</span>}
    </Link>
  )
}

export default function PedidosPage() {
  const contexto = useOutletContext() ?? {}
  const resumo = contexto.resumo ?? {}

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <h1 className={styles.titulo}>Gestão de Pedidos</h1>
          <p className={styles.subtitulo}>Controle e expedição em tempo real</p>
        </div>
        <button type="button" className={styles.novoPedido} disabled title="Disponível em uma próxima sprint">
          <Icone nome="mais" tamanho={18} />
          Novo Pedido
        </button>
      </header>

      <nav className={styles.abas} role="tablist" aria-label="Visões de pedidos">
        {ABAS.map((aba) => (
          <Aba key={aba.para} para={aba.para} rotulo={aba.rotulo} selo={resumo[aba.chave]} />
        ))}
      </nav>

      <Outlet context={contexto} />
    </div>
  )
}
