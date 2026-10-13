import { useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { getUser } from '../service/userService'

const menus = [
  { to: '/board', label: '게시판' },
  { to: '/members', label: '회원정보' },
]

export default function Layout() {
  const token = useAuthStore((s) => s.token)
  const userId = useAuthStore((s) => s.userId)
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  // 내 정보 API(/me)가 없으므로 저장한 userId로 회원 상세를 불러와 이름을 표시한다
  useEffect(() => {
    if (!token || !userId || user) return
    getUser(userId)
      .then(setUser)
      .catch(() => {}) // 401은 api 인터셉터가 처리한다
  }, [token, userId, user, setUser])

  // 로그아웃 API는 없다. 저장된 토큰만 지운다
  const handleLogout = () => {
    logout()
    navigate('/board', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <Link to="/board" className="text-base font-bold tracking-tight">
              app-board
            </Link>
            <nav className="flex gap-4">
              {menus.map((m) => (
                <NavLink
                  key={m.to}
                  to={m.to}
                  className={({ isActive }) =>
                    `text-sm transition-colors ${isActive ? 'font-semibold text-ink' : 'text-muted hover:text-ink'}`
                  }
                >
                  {m.label}
                </NavLink>
              ))}
            </nav>
          </div>
          {token ? (
            <div className="flex items-center gap-3 text-sm">
              <Link to={`/members/${encodeURIComponent(userId)}`} title="내 정보" className="hover:underline">
                <b className="font-medium">{user?.userName ?? userId}</b>
                <span className="muted"> 님</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/signup" className="btn btn-secondary btn-sm">
                회원가입
              </Link>
              <Link to="/login" className="btn btn-primary btn-sm">
                로그인
              </Link>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-line py-6 text-center text-xs text-muted">app-board</footer>
    </div>
  )
}
