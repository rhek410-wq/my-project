import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createMember, getMember, updateMember } from '../service/memberService'
import { useAuthStore } from '../stores/authStore'
import { useThemeConfig } from '../stores/themeStore'

// 등록(/members/new)과 수정(/members/:id/edit)을 같이 처리한다 (운영자 전용)
export default function MemberFormPage() {
  const deco = useThemeConfig()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const saveLogin = useAuthStore((s) => s.login)
  const token = useAuthStore((s) => s.token)

  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'USER' })
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    getMember(id)
      .then((m) => setForm({ username: m.username, password: '', name: m.name, role: m.role }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const change = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username.trim() || !form.name.trim() || (!isEdit && !form.password)) {
      setError(isEdit ? '아이디와 이름을 입력해 주세요.' : '아이디, 비밀번호, 이름을 모두 입력해 주세요.')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (isEdit) {
        const saved = await updateMember(id, form)
        // 내 정보를 고쳤으면 상단 바에 보이는 로그인 정보도 바꾼다
        if (saved.id === user.id) saveLogin({ token, user: saved })
      } else {
        await createMember(form)
      }
      navigate('/members', { replace: true })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) return <p className="text-center text-ink/50">{deco.loading}</p>

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-md space-y-4 p-8">
      <h1 className="page-title">{isEdit ? '✏️ 회원 수정' : '🎉 회원 등록'}</h1>

      <label className="block space-y-1">
        <span className="label">아이디</span>
        <input name="username" value={form.username} onChange={change} autoComplete="off" className="input" />
      </label>

      <label className="block space-y-1">
        <span className="label">비밀번호{isEdit && <span className="font-normal text-ink/50"> (비워 두면 그대로 유지)</span>}</span>
        <input name="password" type="password" value={form.password} onChange={change} autoComplete="new-password" className="input" />
      </label>

      <label className="block space-y-1">
        <span className="label">이름</span>
        <input name="name" value={form.name} onChange={change} className="input" />
      </label>

      <fieldset className="space-y-2">
        <legend className="label">권한</legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'ADMIN', label: '운영자', emoji: '👑' },
            { value: 'USER', label: '사용자', emoji: '🐣' },
          ].map((r) => (
            <label
              key={r.value}
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl border-2 py-3 font-bold transition ${
                form.role === r.value ? 'border-point bg-soft text-point-dark' : 'border-line text-ink/60 hover:bg-soft/50'
              }`}
            >
              <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={change} className="sr-only" />
              <span className="text-xl">{r.emoji}</span>
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p className="alert-error">🥲 {error}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => navigate('/members')} className="btn btn-ghost">
          취소
        </button>
        <button type="submit" disabled={saving} className="btn btn-point">
          {saving ? '저장 중...' : isEdit ? `수정 완료 ${deco.heart}` : `등록하기 ${deco.heart}`}
        </button>
      </div>
    </form>
  )
}
