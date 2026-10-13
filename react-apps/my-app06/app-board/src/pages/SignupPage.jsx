import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { signup } from '../service/authService'
import { useAuthStore } from '../stores/authStore'
import GenderPicker from '../comp/GenderPicker'
import { validateSignup } from '../utils/validation'

const initialForm = { userId: '', password: '', passwordConfirm: '', userName: '', birthDate: '', gender: '' }

export default function SignupPage() {
  const token = useAuthStore((s) => s.token)
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (token) return <Navigate to="/" replace />

  const change = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const message = validateSignup(form)
    if (message) {
      setError(message)
      return
    }
    setSaving(true)
    setError('')
    try {
      const { userId, password, userName, birthDate, gender } = form
      await signup({ userId, password, userName, birthDate, gender })
      navigate('/login', { replace: true, state: { signedUpId: userId } })
    } catch (err) {
      // 409 CONFLICT: 아이디 중복
      setError(err.code === 'CONFLICT' ? '이미 사용 중인 아이디입니다.' : err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-md space-y-6">
      <div>
        <p className="eyebrow muted">Join</p>
        <h1 className="page-title mt-2">Create an Account</h1>
        <p className="muted mt-2 text-sm">회원이 되어 위시리스트와 주문을 편하게 관리하세요.</p>
      </div>

      <label className="block space-y-1.5">
        <span className="label">아이디 <span className="font-normal text-muted">(4~50자)</span></span>
        <input name="userId" value={form.userId} onChange={change} maxLength={50} autoComplete="username" className="input" />
      </label>

      <label className="block space-y-1.5">
        <span className="label">비밀번호 <span className="font-normal text-muted">(8~100자)</span></span>
        <input name="password" type="password" value={form.password} onChange={change} maxLength={100} autoComplete="new-password" className="input" />
      </label>

      <label className="block space-y-1.5">
        <span className="label">비밀번호 확인</span>
        <input name="passwordConfirm" type="password" value={form.passwordConfirm} onChange={change} maxLength={100} autoComplete="new-password" className="input" />
      </label>

      <label className="block space-y-1.5">
        <span className="label">이름</span>
        <input name="userName" value={form.userName} onChange={change} maxLength={50} className="input" />
      </label>

      <label className="block space-y-1.5">
        <span className="label">생년월일</span>
        <input name="birthDate" type="date" value={form.birthDate} onChange={change} className="input" />
      </label>

      <GenderPicker value={form.gender} onChange={change} />

      {error && <p className="alert-error">{error}</p>}

      <div className="flex items-center justify-between gap-2">
        <Link to="/login" className="muted text-sm hover:text-ink hover:underline">
          이미 계정이 있어요
        </Link>
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? '가입 중...' : '가입하기'}
        </button>
      </div>
    </form>
  )
}
