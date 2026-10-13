import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { createBoard, getBoard, updateBoard } from '../service/boardService'
import { useAuthStore } from '../stores/authStore'
import { validateBoard } from '../utils/validation'
import { LOADING_TEXT, NOT_WRITER_MESSAGE } from '../utils/format'

// 등록(/board/new)과 수정(/board/:id/edit)을 같이 처리한다
export default function BoardFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const userId = useAuthStore((s) => s.userId)

  // 상세 화면에서 넘겨준 글이 있으면 그대로 쓴다 (상세 조회를 다시 하면 조회수가 오른다)
  const passed = isEdit && String(location.state?.board?.id) === id ? location.state.board : null

  const [title, setTitle] = useState(passed?.title ?? '')
  const [content, setContent] = useState(passed?.content ?? '')
  const [loading, setLoading] = useState(isEdit && !passed)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const requestedId = useRef(null)

  useEffect(() => {
    // 주소로 바로 들어온 경우에만 불러온다. StrictMode 중복 호출 방지
    if (!isEdit || passed || requestedId.current === id) return
    requestedId.current = id
    getBoard(id)
      .then((board) => {
        setTitle(board.title)
        setContent(board.content)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, isEdit, passed])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const message = validateBoard({ title, content })
    if (message) {
      setError(message)
      return
    }
    setSaving(true)
    setError('')
    try {
      const data = { title, content }
      const saved = isEdit ? await updateBoard(id, data) : await createBoard(data)
      navigate(`/board/${saved.id}`, { replace: true, state: { board: saved } })
    } catch (err) {
      setError(err.code === 'ACCESS_DENIED' ? NOT_WRITER_MESSAGE : err.message)
      setSaving(false)
    }
  }

  if (loading) return <p className="text-center text-muted">{LOADING_TEXT}</p>

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div>
        <h1 className="page-title">{isEdit ? '게시글 수정' : '새 글 쓰기'}</h1>
        {!isEdit && <p className="muted mt-1 text-sm">글쓴이: <b>{user?.userName ?? userId}</b></p>}
      </div>
      <label className="block space-y-1.5">
        <span className="label">
          제목 <span className="font-normal text-muted">({title.length}/200)</span>
        </span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="제목을 입력해 주세요" className="input" />
      </label>
      <label className="block space-y-1.5">
        <span className="label">내용</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력해 주세요"
          rows={10}
          className="input-box resize-y"
        />
      </label>
      {error && <p className="alert-error">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
          취소
        </button>
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? '저장 중...' : isEdit ? '수정 완료' : '등록하기'}
        </button>
      </div>
    </form>
  )
}
