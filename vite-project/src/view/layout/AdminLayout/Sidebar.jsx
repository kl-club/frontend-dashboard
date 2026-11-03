import { NavLink } from 'react-router-dom'
import Icone from '../../components/Icone/Icone.jsx'
import styles from './Sidebar.module.css'

const EM_BREVE = [
  { id: 'cardapio', rotulo: 'Cardápio', icone: 'cardapio' },
  { id: 'club', rotulo: 'KL CLUB', icone: 'clube' },
  { id: 'clientes', rotulo: 'Clientes', icone: 'clientes' },
]

function classeLink({ isActive }) {
  return isActive ? `${styles.item} ${styles.ativo}` : styles.item
}

export default function Sidebar({ id, aberta, badgePedidos, onNavegar, onSair }) {
  return (
    <aside id={id} className={`${styles.sidebar} ${aberta ? styles.aberta : ''}`} aria-label="Menu principal">
      <div className={styles.marca}>
        <span className={styles.logo} aria-hidden="true">KL</span>
        <span className={styles.marcaTexto}>
          KL CLUB <small>Gestão</small>
        </span>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.lista}>
          <li>
            <NavLink to="/dashboard" className={classeLink} title="Visão Geral" onClick={onNavegar}>
              <Icone nome="painel" tamanho={20} />
              <span className={styles.rotulo}>Visão Geral</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/pedidos" className={classeLink} title="Pedidos" onClick={onNavegar}>
              <Icone nome="pedidos" tamanho={20} />
              <span className={styles.rotulo}>Pedidos</span>
              {badgePedidos != null && (
                <span className={`${styles.badge} tabular`} aria-label={`${badgePedidos} pedidos no histórico`}>
                  {badgePedidos}
                </span>
              )}
            </NavLink>
          </li>
          {EM_BREVE.map((item) => (
            <li key={item.id}>
              <span className={`${styles.item} ${styles.desabilitado}`} aria-disabled="true" title={`${item.rotulo} — em breve`}>
                <Icone nome={item.icone} tamanho={20} />
                <span className={styles.rotulo}>{item.rotulo}</span>
                <span className={styles.emBreve}>Em breve</span>
              </span>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.rodape}>
        <button type="button" className={`${styles.item} ${styles.sair}`} title="Sair" onClick={onSair}>
          <Icone nome="sair" tamanho={20} />
          <span className={styles.rotulo}>Sair</span>
        </button>
      </div>
    </aside>
  )
}
