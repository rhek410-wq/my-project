import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../service/authService'
import { useAuthStore } from '../stores/authStore'
import ThemePicker from '../comp/ThemePicker'
import { useThemeConfig } from '../stores/themeStore'

// 로그인 화면 배경에 떠다니는 장식 자리 (이모지는 테마마다 다르다)
const decoSpots = [
  { pos: 'top-[12%] left-[8%]', delay: '0s' },
  { pos: 'top-[10%] right-[10%]', delay: '1s' },
  { pos: 'bottom-[14%] left-[14%]', delay: '2s' },
  { pos: 'bottom-[7%] right-[10%]', delay: '0.5s' },
  { pos: 'top-[6%] left-[46%]', delay: '1.5s' },
]

export default function LoginPage() {
  const deco = useThemeConfig()
  const token = useAuthStore((s) => s.token)
  const saveLogin = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const from = useLocation().state?.from || '/board'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (token) return <Navigate to={from} replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      setError('아이디와 비밀번호를 입력해 주세요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await login(username, password)
      saveLogin(data)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-clip bg-gradient-to-b from-bg-top via-soft to-base px-4 py-10">
      {/* 배경 장식 */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sun/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-24 h-80 w-80 rounded-full bg-surface blur-3xl" />
      {decoSpots.map((d, i) => (
        <span
          key={d.pos}
          className={`pointer-events-none absolute hidden animate-float text-4xl select-none sm:block ${d.pos}`}
          style={{ animationDelay: d.delay }}
        >
          {deco.decorations[i]}
        </span>
      ))}

      <div className="absolute top-4 right-4 z-10">
        <ThemePicker />
      </div>

      <div className="relative grid w-full max-w-4xl items-center gap-10 md:grid-cols-2">
        {/* 소개 */}
        <div className="text-center md:text-left">
          <div className="mb-4 inline-block animate-float text-7xl">{deco.mascot}</div>
          <h1 className="font-cute text-5xl text-point">mock-board</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink/80">
            오늘 있었던 일, 궁금한 것,<br />
            {deco.intro}
          </p>
          <ul className="mt-6 hidden space-y-2 text-sm text-ink/70 md:block">
            <li>📝 누구나 게시글을 볼 수 있어요</li>
            <li>✏️ 로그인하면 내 글을 쓰고 고칠 수 있어요</li>
            <li>🧸 회원 목록도 확인할 수 있어요</li>
          </ul>
        </div>

        {/* 로그인 카드 */}
        <form onSubmit={handleSubmit} className="card mx-auto w-full max-w-sm space-y-4 p-8">
          <div className="text-center">
            <h2 className="font-cute text-3xl text-ink">반가워요! 👋</h2>
            <p className="mt-1 text-sm text-ink/60">로그인하고 함께 이야기해요</p>
          </div>
          <label className="block space-y-1">
            <span className="label">🐾 아이디</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력해 주세요"
              autoComplete="username"
              className="input"
            />
          </label>
          <label className="block space-y-1">
            <span className="label">🔒 비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해 주세요"
              autoComplete="current-password"
              className="input"
            />
          </label>
          {error && <p className="alert-error">🥲 {error}</p>}
          <button type="submit" disabled={loading} className="btn btn-point w-full py-3 text-base">
            {loading ? '두근두근 로그인 중...' : `로그인 ${deco.heart}`}
          </button>
          <Link to="/board" className="block text-center text-sm text-ink/60 hover:text-point hover:underline">
            로그인 없이 게시판 구경하기 →
          </Link>
        </form>
      </div>
    </div>
  )
}
