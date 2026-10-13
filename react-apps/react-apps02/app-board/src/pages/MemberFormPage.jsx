import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getUser, updateUser } from '../service/userService'
import { useAuthStore } from '../stores/authStore'
import GenderPicker from '../comp/GenderPicker'
import { validateUserUpdate } from '../utils/validation'
import { LOADING_TEXT } from '../utils/format'

function toForm(m) {
  return { userName: m.userName, birthDate: m.birthDate, gender: m.gender, password: '', passwordConfirm: '' }
}

// 내 정보 수정 (/members/:userId/edit, 본인만)
export default function MemberFormPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const myId = useAuthStore((s) => s.userId)
  const setUser = useAuthStore((s) => s.setUser)
  const isMe = userId === myId

  const passed = location.state?.member?.userId === userId ? location.state.member : null
  const [form, setForm] = useState(passed ? toForm(passed) : null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isMe || passed) return
    getUser(userId)
      .then((m) => setForm(toForm(m)))
      .catch((err) => setError(err.message))
  }, [userId, isMe, passed])

  // 다른 사람 정보는 수정할 수 없다 (서버도 403으로 막는다)
  if (!isMe) return <Navigate to={`/members/${encodeURIComponent(userId)}`} replace />

  const change = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const message = validateUserUpdate(form)
    if (message) {
      setError(message)
      return
    }
    setSaving(true)
    setError('')
    try {
      const { userName, birthDate, gender, password } = form
      // 비밀번호를 바꾸지 않으면 필드를 아예 보내지 않는다 (빈 문자열은 서버 검증 실패)
      const data = { userName, birthDate, gender, ...(password ? { password } : {}) }
      const saved = await updateUser(userId, data)
      setUser(saved) // 상단 바의 이름도 바꾼다
      navigate(`/members/${encodeURIComponent(userId)}`, { replace: true })
    } catch (err) {
      setError(err.code === 'ACCESS_DENIED' ? '본인 정보만 수정할 수 있습니다.' : err.message)
      setSaving(false)
    }
  }

  if (!form)
    return error ? <p className="alert-error">{error}</p> : <p className="text-center text-muted">{LOADING_TEXT}</p>

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-md space-y-4">
      <h1 className="page-title">내 정보 수정</h1>

      <label className="block space-y-1.5">
        <span className="label">아이디</span>
        <input value={userId} disabled className="input bg-subtle text-muted" />
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

      <label className="block space-y-1.5">
        <span className="label">
          새 비밀번호 <span className="font-normal text-muted">(바꿀 때만 입력, 8~100자)</span>
        </span>
        <input name="password" type="password" value={form.password} onChange={change} maxLength={100} autoComplete="new-password" className="input" />
      </label>

      {form.password && (
        <label className="block space-y-1.5">
          <span className="label">새 비밀번호 확인</span>
          <input name="passwordConfirm" type="password" value={form.passwordConfirm} onChange={change} maxLength={100} autoComplete="new-password" className="input" />
        </label>
      )}

      {error && <p className="alert-error">{error}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
          취소
        </button>
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? '저장 중...' : '수정 완료'}
        </button>
      </div>
    </form>
  )
}
