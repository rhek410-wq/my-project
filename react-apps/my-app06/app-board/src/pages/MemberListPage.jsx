import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getUsers } from '../service/userService'
import { useAuthStore } from '../stores/authStore'
import { LOADING_TEXT } from '../utils/format'
import Pagination from '../comp/Pagination'

export default function MemberListPage() {
  const myId = useAuthStore((s) => s.userId)

  // 주소의 page는 1부터, 서버에는 0부터 보낸다
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const keyword = searchParams.get('keyword') || ''

  const [draft, setDraft] = useState(keyword)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setDraft(keyword)
  }, [keyword])

  useEffect(() => {
    setLoading(true)
    setError('')
    // 조건이 바뀌어 이전 요청이 늦게 도착하면 무시한다
    let ignore = false
    getUsers({ page: page - 1, size: 10, keyword: keyword.trim() })
      .then((res) => !ignore && setData(res))
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false))
    return () => {
      ignore = true
    }
  }, [page, keyword])

  const updateParams = ({ page: nextPage = page, keyword: nextKeyword = keyword }) => {
    const params = {}
    if (nextPage > 1) params.page = nextPage
    if (nextKeyword) params.keyword = nextKeyword
    setSearchParams(params)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    updateParams({ keyword: draft.trim(), page: 1 })
  }

  const users = data?.content ?? []

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">회원정보</h1>
          <p className="muted mt-1 text-sm">{data ? <>전체 {data.totalElements}명</> : '\u00a0'}</p>
        </div>
        <Link to={`/members/${encodeURIComponent(myId)}`} className="btn btn-secondary">
          내 정보
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="이름으로 검색해 주세요"
          className="input-box min-w-40 flex-1"
          aria-label="이름 검색"
        />
        <button type="submit" className="btn btn-secondary">
          검색
        </button>
        {keyword && (
          <button type="button" onClick={() => updateParams({ keyword: '', page: 1 })} className="btn btn-secondary">
            초기화
          </button>
        )}
      </form>

      {error && <p className="alert-error">{error}</p>}

      <div className="card overflow-x-auto p-0">
        <table className="table">
          <thead>
            <tr>
              <th className="text-left">아이디</th>
              <th className="text-left">이름</th>
              <th className="w-32">생년월일</th>
              <th className="w-24">성별</th>
              <th className="w-28">권한</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted">{LOADING_TEXT}</td>
              </tr>
            )}
            {!loading && !error && users.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted">회원이 없습니다.</td>
              </tr>
            )}
            {!loading &&
              users.map((u) => (
                <tr key={u.userId}>
                  <td>
                    <Link to={`/members/${encodeURIComponent(u.userId)}`} className="hover:underline">
                      {u.userId}
                    </Link>
                    {u.userId === myId && <span className="badge ml-1.5">나</span>}
                  </td>
                  <td className="font-medium">{u.userName}</td>
                  <td className="text-center text-xs text-muted">{u.birthDate}</td>
                  <td className="text-center">{u.gender}</td>
                  <td className="text-center">
                    <span className="badge">{u.roleName}</span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {data && <Pagination page={data.number} totalPages={data.totalPages} onChange={(p) => updateParams({ page: p + 1 })} />}
    </div>
  )
}
