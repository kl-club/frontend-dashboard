import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useResumoPedidosViewModel } from '../../../viewmodel/useResumoPedidosViewModel.js'
import Icone from '../../components/Icone/Icone.jsx'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import styles from './AdminLayout.module.css'

const ID_MENU = 'menu-principal'

export default function AdminLayout() {
  const [menuAberto, setMenuAberto] = useState(false)
  const { pathname } = useLocation()
  const resumo = useResumoPedidosViewModel()
  const emPedidos = pathname.startsWith('/pedidos')

  useEffect(() => {
    if (!menuAberto) return undefined
    const aoTeclar = (e) => {
      if (e.key === 'Escape') setMenuAberto(false)
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [menuAberto])

  return (
    <div className={styles.layout}>
      <Sidebar
        id={ID_MENU}
        aberta={menuAberto}
        badgePedidos={resumo.totalHistorico}
        onNavegar={() => setMenuAberto(false)}
      />
      {menuAberto && <div className={styles.veu} onClick={() => setMenuAberto(false)} aria-hidden="true" />}

      <div className={styles.principal}>
        <div className={styles.barraMobile}>
          <button
            type="button"
            className={styles.botaoMenu}
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuAberto}
            aria-controls={ID_MENU}
            onClick={() => setMenuAberto((v) => !v)}
          >
            <Icone nome={menuAberto ? 'fechar' : 'menu'} tamanho={22} />
          </button>
          <span className={styles.marcaMobile}>
            KL CLUB <span>Gestão</span>
          </span>
        </div>

        {emPedidos && <Topbar loja={resumo.loja} />}

        <main className={styles.conteudo}>
          <Outlet context={{ resumo }} />
        </main>
      </div>
    </div>
  )
}
