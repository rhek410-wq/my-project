import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteUser, getUser } from '../service/userService'
import { useAuthStore } from '../stores/authStore'
import { LOADING_TEXT } from '../utils/format'

export default function MemberDetailPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const myId = useAuthStore((s) => s.userId)
  const logout = useAuthStore((s) => s.logout)
  const isMe = userId === myId

  const [member, setMember] = useState(null)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setMember(null)
    setError('')
    getUser(userId)
      .then(setMember)
      .catch((err) => setError(err.code === 'NOT_FOUND' ? '회원을 찾을 수 없어요.' : err.message))
  }, [userId])

  const handleWithdraw = async () => {
    const ok = window.confirm(
      '정말 탈퇴할까요?\n\n탈퇴하면 내가 작성한 게시글도 모두 함께 삭제되며, 되돌릴 수 없습니다.'
    )
    if (!ok) return
    setDeleting(true)
    setActionError('')
    try {
      await deleteUser(userId)
      // 탈퇴 성공 → 홈으로 이동한 뒤 토큰을 지우고 로그아웃
      alert('탈퇴가 완료되었습니다. 그동안 함께해 주셔서 고마워요.')
      navigate('/', { replace: true })
      logout()
    } catch (err) {
      setActionError(err.code === 'ACCESS_DENIED' ? '본인만 탈퇴할 수 있습니다.' : err.message)
      setDeleting(false)
    }
  }

  if (error)
    return (
      <div className="space-y-4">
        <p className="alert-error">{error}</p>
        <Link to="/members" className="btn btn-secondary">
          회원 목록
        </Link>
      </div>
    )
  if (!member) return <p className="text-center text-muted">{LOADING_TEXT}</p>

  const rows = [
    { label: '아이디', value: member.userId },
    { label: '이름', value: member.userName },
    { label: '생년월일', value: member.birthDate },
    { label: '성별', value: member.gender },
    { label: '권한', value: member.roleName },
  ]

  return (
    <div className="mx-auto max-w-md space-y-5">
      <section className="card space-y-4">
        {isMe && <p className="eyebrow muted">My Page</p>}
        <h1 className="page-title flex items-center gap-2">
          {member.userName} {isMe && <span className="badge">나</span>}
        </h1>
        <dl className="divide-y divide-line border-t border-line text-sm">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between py-2.5">
              <dt className="text-muted">{r.label}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {isMe && (
        <div className="grid grid-cols-2 gap-2">
          <Link to="/wishlist" className="btn btn-secondary">Wishlist</Link>
          <Link to="/cart" className="btn btn-secondary">Cart</Link>
        </div>
      )}

      {actionError && <p className="alert-error">{actionError}</p>}

      <div className="flex justify-between">
        <Link to="/members" className="btn btn-secondary">
          회원 목록
        </Link>
        {/* 수정·탈퇴는 본인만 할 수 있다 */}
        {isMe && (
          <div className="flex gap-2">
            <Link to={`/members/${encodeURIComponent(userId)}/edit`} state={{ member }} className="btn btn-secondary">
              정보 수정
            </Link>
            <button onClick={handleWithdraw} disabled={deleting} className="btn btn-danger">
              {deleting ? '탈퇴 중...' : '회원 탈퇴'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
