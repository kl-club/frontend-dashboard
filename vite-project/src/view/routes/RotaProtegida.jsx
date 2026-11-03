import { Navigate, Outlet } from 'react-router-dom'
import { ROTA_LOGIN } from '../../model/constants/auth.js'
import { useSessaoViewModel } from '../../viewmodel/useSessaoViewModel.js'

/** Só deixa passar quem tem sessão; os demais vão para o login. */
export default function RotaProtegida() {
  const { autenticado } = useSessaoViewModel()
  return autenticado ? <Outlet /> : <Navigate to={ROTA_LOGIN} replace />
}
