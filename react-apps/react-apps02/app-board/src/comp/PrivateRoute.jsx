import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

// 로그인하지 않았으면 로그인 화면으로 보낸다 (로그인 후 원래 화면으로 돌아옴)
export default function PrivateRoute() {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()
  return token ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />
}
