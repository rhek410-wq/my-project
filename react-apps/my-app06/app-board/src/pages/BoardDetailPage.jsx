import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { deleteBoard, getBoard } from '../service/boardService'
import { useAuthStore } from '../stores/authStore'
import { formatDate, LOADING_TEXT, NOT_WRITER_MESSAGE } from '../utils/format'

export default function BoardDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const token = useAuthStore((s) => s.token)

  const [board, setBoard] = useState(null)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const requestedId = useRef(null)

  useEffect(() => {
    // 상세 조회는 호출마다 조회수가 오른다. StrictMode에서 두 번 호출되는 것을 막는다
    if (requestedId.current === id) return
    requestedId.current = id
    setError('')
    // 작성·수정 직후에는 저장 응답을 그대로 보여준다 (다시 조회하면 조회수가 오른다)
    const saved = location.state?.board
    if (saved && String(saved.id) === id) {
      setBoard(saved)
      return
    }
    setBoard(null)
    getBoard(id)
      .then(setBoard)
      .catch((err) => setError(err.code === 'NOT_FOUND' ? '게시글을 찾을 수 없어요.' : err.message))
  }, [id, location.state])

  // 응답에 작성자 userId가 없어 본인 글인지 알 수 없다 → 로그인했으면 버튼을 보여주고 서버의 403으로 판단한다
  const handleEdit = () => {
    // 이미 받은 글을 넘겨서 수정 화면이 상세 조회(조회수 증가)를 다시 하지 않게 한다
    navigate(`/board/${board.id}/edit`, { state: { board } })
  }

  const handleDelete = async () => {
    if (!window.confirm('이 글을 삭제할까요?')) return
    setActionError('')
    try {
      await deleteBoard(id)
      navigate('/board', { replace: true })
    } catch (err) {
      setActionError(err.code === 'ACCESS_DENIED' ? NOT_WRITER_MESSAGE : err.message)
    }
  }

  if (error)
    return (
      <div className="space-y-4">
        <p className="alert-error">{error}</p>
        <Link to="/board" className="btn btn-secondary">
          목록
        </Link>
      </div>
    )
  if (!board) return <p className="text-center text-muted">{LOADING_TEXT}</p>

  return (
    <div className="space-y-5">
      <article className="card p-0">
        <header className="border-b border-line px-6 py-5">
          <h1 className="text-2xl font-semibold tracking-tight break-words">{board.title}</h1>
          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            {[
              ['글쓴이', board.writer],
              ['조회수', board.viewCount],
              ['등록일', formatDate(board.createdAt)],
              ['수정일', formatDate(board.updatedAt)],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-1">
                <dt>{label}</dt>
                <dd className="font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </header>
        <p className="min-h-40 px-6 py-6 leading-relaxed break-words whitespace-pre-wrap">{board.content}</p>
      </article>

      {actionError && <p className="alert-error">{actionError}</p>}

      <div className="flex justify-between">
        <Link to="/board" className="btn btn-secondary">
          목록
        </Link>
        {token && (
          <div className="flex gap-2">
            <button onClick={handleEdit} className="btn btn-secondary">
              수정
            </button>
            <button onClick={handleDelete} className="btn btn-danger">
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
