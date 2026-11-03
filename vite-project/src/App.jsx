import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './view/layout/AdminLayout/AdminLayout.jsx'
import DashboardPage from './view/pages/DashboardPage/DashboardPage.jsx'
import PedidosPage from './view/pages/PedidosPage/PedidosPage.jsx'
import PedidosHojeTab from './view/pages/PedidosPage/PedidosHojeTab.jsx'
import HistoricoTab from './view/pages/PedidosPage/HistoricoTab.jsx'
import LoginPage from './view/pages/LoginPage/LoginPage.jsx'
import RotaProtegida from './view/routes/RotaProtegida.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RotaProtegida />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/pedidos" element={<PedidosPage />}>
              <Route index element={<Navigate to="hoje" replace />} />
              <Route path="hoje" element={<PedidosHojeTab />} />
              <Route path="historico" element={<HistoricoTab />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
