import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { ROLE_EMOJI, ROLE_LABEL } from '../utils/format'
import ThemePicker from './ThemePicker'
import { useThemeConfig } from '../stores/themeStore'

const menus = [
  { to: '/board', label: '게시판', emoji: '📝' },
  { to: '/members', label: '회원정보', emoji: '🧸' },
]

export default function Layout() {
  const deco = useThemeConfig()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/board', { replace: true })
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b-2 border-line bg-surface/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/board" className="flex items-center gap-1.5 font-cute text-2xl text-point">
              <span className="inline-block animate-wiggle">{deco.mascot}</span>
              mock-board
            </Link>
            <nav className="flex gap-1 rounded-full bg-soft p-1">
              {menus.map((m) => (
                <NavLink
                  key={m.to}
                  to={m.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-1.5 text-sm font-bold transition ${
                      isActive ? 'bg-surface text-point-dark shadow-sm' : 'text-ink/70 hover:text-point'
                    }`
                  }
                >
                  {m.emoji} {m.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <ThemePicker />
          {user ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1.5 rounded-full bg-base px-3 py-1.5">
                <span>{ROLE_EMOJI[user.role]}</span>
                <b>{user.name}</b>
                <span className={`badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                  {ROLE_LABEL[user.role]}
                </span>
              </span>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                로그아웃
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-point btn-sm">
              🔑 로그인
            </Link>
          )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="pb-8 text-center text-xs text-point-light">made with {deco.heart} mock-board</footer>
    </div>
  )
}
