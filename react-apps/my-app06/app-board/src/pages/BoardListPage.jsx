import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getBoards } from '../service/boardService'
import { formatDate, LOADING_TEXT } from '../utils/format'
import Pagination from '../comp/Pagination'

const SORTS = [
  { value: 'createdAt,desc', label: '최신순' },
  { value: 'createdAt,asc', label: '오래된순' },
  { value: 'viewCount,desc', label: '조회수 많은순' },
  { value: 'title,asc', label: '제목순' },
  { value: 'updatedAt,desc', label: '최근 수정순' },
]
const SIZES = [10, 20, 30]

export default function BoardListPage() {
  // 검색 조건은 주소(?page=1&...)에 둬서 상세 화면에 갔다 와도 유지된다. 주소의 page는 1부터.
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const size = SIZES.includes(Number(searchParams.get('size'))) ? Number(searchParams.get('size')) : 10
  // 정해진 값만 보낸다 (잘못된 sort는 서버가 오류로 응답한다)
  const sort = SORTS.some((s) => s.value === searchParams.get('sort')) ? searchParams.get('sort') : SORTS[0].value
  const searchType = searchParams.get('searchType') === 'writer' ? 'writer' : 'title'
  const keyword = searchParams.get('keyword') || ''

  const [draft, setDraft] = useState({ searchType, keyword })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setDraft({ searchType, keyword })
  }, [searchType, keyword])

  useEffect(() => {
    setLoading(true)
    setError('')
    // 조건이 바뀌어 이전 요청이 늦게 도착하면 무시한다
    let ignore = false
    getBoards({ page: page - 1, size, sort, ...(keyword ? { searchType, keyword } : {}) })
      .then((res) => !ignore && setData(res))
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false))
    return () => {
      ignore = true
    }
  }, [page, size, sort, searchType, keyword])

  const updateParams = (changes) => {
    const next = { page, size, sort, searchType, keyword, ...changes }
    const params = {}
    if (next.page > 1) params.page = next.page
    if (next.size !== 10) params.size = next.size
    if (next.sort !== SORTS[0].value) params.sort = next.sort
    if (next.keyword) {
      params.searchType = next.searchType
      params.keyword = next.keyword
    }
    setSearchParams(params)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    updateParams({ ...draft, keyword: draft.keyword.trim(), page: 1 })
  }

  const boards = data?.content ?? []

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Q&amp;A</h1>
          <p className="muted mt-1 text-sm">{data ? <>전체 {data.totalElements}개</> : '\u00a0'}</p>
        </div>
        {/* 로그인하지 않았으면 로그인 화면을 거쳐 등록 화면으로 온다 */}
        <Link to="/board/new" className="btn btn-primary">
          글쓰기
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <form onSubmit={handleSearch} className="flex flex-1 flex-wrap gap-2">
          <select
            value={draft.searchType}
            onChange={(e) => setDraft((d) => ({ ...d, searchType: e.target.value }))}
            className="input-box w-auto"
            aria-label="검색 대상"
          >
            <option value="title">제목</option>
            <option value="writer">글쓴이</option>
          </select>
          <input
            value={draft.keyword}
            onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value }))}
            placeholder="검색어를 입력해 주세요"
            className="input-box min-w-40 flex-1"
            aria-label="검색어"
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
        <div className="flex gap-2">
          <select value={sort} onChange={(e) => updateParams({ sort: e.target.value, page: 1 })} className="input-box w-auto" aria-label="정렬">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select value={size} onChange={(e) => updateParams({ size: Number(e.target.value), page: 1 })} className="input-box w-auto" aria-label="페이지 크기">
            {SIZES.map((n) => (
              <option key={n} value={n}>
                {n}개씩
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="alert-error">{error}</p>}

      <div className="card overflow-x-auto p-0">
        <table className="table">
          <thead>
            <tr>
              <th className="w-16">번호</th>
              <th className="text-left">제목</th>
              <th className="w-28">글쓴이</th>
              <th className="w-24">조회수</th>
              <th className="w-40">등록일</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted">{LOADING_TEXT}</td>
              </tr>
            )}
            {!loading && !error && boards.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted">
                  {keyword ? '검색 결과가 없습니다.' : '등록된 게시글이 없습니다.'}
                </td>
              </tr>
            )}
            {!loading &&
              boards.map((board) => (
                <tr key={board.id}>
                  <td className="text-center text-muted">{board.id}</td>
                  <td>
                    <Link to={`/board/${board.id}`} className="font-medium hover:underline">
                      {board.title}
                    </Link>
                  </td>
                  <td className="text-center">{board.writer}</td>
                  <td className="text-center text-muted">{board.viewCount}</td>
                  <td className="text-center text-xs text-muted">{formatDate(board.createdAt)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {data && <Pagination page={data.number} totalPages={data.totalPages} onChange={(p) => updateParams({ page: p + 1 })} />}
    </div>
  )
}
