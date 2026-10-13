import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { login } from '../service/authService'
import { useAuthStore } from '../stores/authStore'
import { getTokenUserId } from '../utils/jwt'

export default function LoginPage() {
  const token = useAuthStore((s) => s.token)
  const saveLogin = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  // 로그인 후 돌아갈 곳: 화면 이동(state) 또는 토큰 만료로 튕겨 왔을 때(?from=)
  const from = location.state?.from || searchParams.get('from') || '/board'
  const expired = searchParams.get('expired') === '1'
  const signedUpId = location.state?.signedUpId

  const [userId, setUserId] = useState(signedUpId || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (token) return <Navigate to={from} replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userId.trim() || !password) {
      setError('아이디와 비밀번호를 입력해 주세요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { accessToken } = await login(userId, password)
      // JWT sub에 userId가 들어 있다. 혹시 없으면 입력한 아이디를 쓴다
      saveLogin({ token: accessToken, userId: getTokenUserId(accessToken) || userId })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link to="/board" className="text-2xl font-bold tracking-tight">
            app-board
          </Link>
          <p className="muted mt-2 text-sm">계정에 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {expired && !error && <p className="alert-error">로그인이 만료되었습니다. 다시 로그인해 주세요.</p>}
          {signedUpId && !error && <p className="alert-success">회원가입이 완료되었습니다. 로그인해 주세요.</p>}
          <label className="block space-y-1.5">
            <span className="label">아이디</span>
            <input value={userId} onChange={(e) => setUserId(e.target.value)} autoComplete="username" className="input" />
          </label>
          <label className="block space-y-1.5">
            <span className="label">비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="input"
            />
          </label>
          {error && <p className="alert-error">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="space-y-2 text-center text-sm">
          <p className="muted">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="font-medium text-ink hover:underline">
              회원가입
            </Link>
          </p>
          <Link to="/board" className="muted block hover:text-ink hover:underline">
            로그인 없이 게시판 보기
          </Link>
        </div>
      </div>
    </div>
  )
}
