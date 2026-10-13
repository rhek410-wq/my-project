import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

// 운영자가 아니면 redirect 경로로 보낸다
export default function AdminRoute({ redirect }) {
  const user = useAuthStore((s) => s.user)
  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to={redirect} replace />
}
