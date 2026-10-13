import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { createComment, deleteComment, getComments, updateComment, voteComment } from '../service/commentService'
import { useAuthStore } from '../stores/authStore'
import { canDeleteComment, canEditComment, formatDate } from '../utils/format'
import VoteButtons from './VoteButtons'
import { useThemeConfig } from '../stores/themeStore'

// 게시글 상세 아래의 댓글 영역
export default function CommentSection({ postId, onCountChange }) {
  const deco = useThemeConfig()
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    getComments(postId)
      .then(setComments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [postId])

  const updateList = (next) => {
    setComments(next)
    onCountChange?.(next.length)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setSaving(true)
    setError('')
    try {
      const created = await createComment(postId, content)
      updateList([...comments, created])
      setContent('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (c) => {
    setEditingId(c.id)
    setEditContent(c.content)
  }

  const handleUpdate = async (id) => {
    if (!editContent.trim()) return
    setError('')
    try {
      const updated = await updateComment(id, editContent)
      setComments((prev) => prev.map((c) => (c.id === id ? updated : c)))
      setEditingId(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('이 댓글을 삭제할까요?')) return
    setError('')
    try {
      await deleteComment(id)
      updateList(comments.filter((c) => c.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="card space-y-4 p-6">
      <h2 className="font-cute text-xl">
        💬 댓글 <span className="text-point">{comments.length}</span>
      </h2>

      {error && <p className="alert-error">🥲 {error}</p>}

      {loading ? (
        <p className="text-center text-sm text-ink/50">{deco.loading}</p>
      ) : comments.length === 0 ? (
        <p className="rounded-2xl bg-soft/60 py-6 text-center text-sm text-ink/50">🌱 첫 댓글을 남겨 주세요!</p>
      ) : (
        <ul className="divide-y-2 divide-dashed divide-line">
          {comments.map((c) => (
            <li key={c.id} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <b>{c.authorName}</b>
                  {c.authorId === user?.id && <span className="badge bg-line text-point-dark">나</span>}
                  <span className="text-xs text-ink/50">
                    {formatDate(c.createdAt)}
                    {c.updatedAt !== c.createdAt && ' (수정됨)'}
                  </span>
                </div>
                {editingId !== c.id && (
                  <div className="flex gap-1.5">
                    {canEditComment(c, user) && (
                      <button onClick={() => startEdit(c)} className="btn btn-mint btn-sm">
                        수정
                      </button>
                    )}
                    {canDeleteComment(c, user) && (
                      <button onClick={() => handleDelete(c.id)} className="btn btn-danger btn-sm">
                        삭제
                      </button>
                    )}
                  </div>
                )}
              </div>

              {editingId === c.id ? (
                <div className="mt-2 space-y-2">
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={2} className="input resize-y" />
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => setEditingId(null)} className="btn btn-ghost btn-sm">
                      취소
                    </button>
                    <button onClick={() => handleUpdate(c.id)} className="btn btn-point btn-sm">
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-1 whitespace-pre-wrap">{c.content}</p>
                  <div className="mt-2">
                    <VoteButtons
                      small
                      target={c}
                      vote={(type) => voteComment(c.id, type)}
                      onChange={(result) => setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, ...result } : x)))}
                    />
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {user ? (
        <form onSubmit={handleCreate} className="space-y-2 border-t-2 border-line pt-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="따뜻한 댓글을 남겨 주세요 💌"
            rows={3}
            className="input resize-y"
          />
          <div className="flex justify-end">
            <button type="submit" disabled={saving || !content.trim()} className="btn btn-point">
              {saving ? '등록 중...' : `댓글 등록 ${deco.heart}`}
            </button>
          </div>
        </form>
      ) : (
        <p className="rounded-2xl bg-soft/60 py-4 text-center text-sm text-ink/60">
          <Link to="/login" state={{ from: location.pathname }} className="font-bold text-point hover:underline">
            로그인
          </Link>
          하고 댓글을 남겨 보세요 🐾
        </p>
      )}
    </section>
  )
}
