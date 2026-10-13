import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteMember, getMembers } from '../service/memberService'
import { useAuthStore } from '../stores/authStore'
import { formatDate, ROLE_EMOJI, ROLE_LABEL } from '../utils/format'
import { useThemeConfig } from '../stores/themeStore'

export default function MemberListPage() {
  const deco = useThemeConfig()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'ADMIN'

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getMembers()
      .then(setMembers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (member) => {
    if (!window.confirm(`${member.name}(${member.username}) 회원을 삭제할까요?`)) return
    try {
      await deleteMember(member.id)
      setMembers((prev) => prev.filter((m) => m.id !== member.id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">🧸 회원정보</h1>
          <p className="mt-1 text-sm text-ink/60">함께하는 친구들이에요</p>
        </div>
        {isAdmin && (
          <Link to="/members/new" className="btn btn-point">
            🎉 회원 등록
          </Link>
        )}
      </div>

      {error && <p className="alert-error">🥲 {error}</p>}

      <div className="card overflow-x-auto p-0">
        <table className="table-cute">
          <thead>
            <tr>
              <th className="w-16">번호</th>
              <th className="text-left">아이디</th>
              <th className="text-left">이름</th>
              <th className="w-28">권한</th>
              <th className="w-40">가입일</th>
              {isAdmin && <th className="w-40">관리</th>}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-ink/50">{deco.loading}</td>
              </tr>
            )}
            {members.map((m) => (
              <tr key={m.id}>
                <td className="text-center text-ink/50">{m.id}</td>
                <td>{m.username}</td>
                <td className="font-bold">
                  {ROLE_EMOJI[m.role]} {m.name}
                </td>
                <td className="text-center">
                  <span className={`badge ${m.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>{ROLE_LABEL[m.role]}</span>
                </td>
                <td className="text-center text-xs text-ink/60">{formatDate(m.createdAt)}</td>
                {isAdmin && (
                  <td>
                    <div className="flex justify-center gap-1.5">
                      <Link to={`/members/${m.id}/edit`} className="btn btn-mint btn-sm">
                        수정
                      </Link>
                      {m.id !== user.id && (
                        <button onClick={() => handleDelete(m)} className="btn btn-danger btn-sm">
                          삭제
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
