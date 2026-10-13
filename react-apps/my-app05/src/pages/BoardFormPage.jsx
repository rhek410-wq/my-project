import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createPost, getPost, updatePost } from '../service/postService'
import { useAuthStore } from '../stores/authStore'
import { canEditPost } from '../utils/format'
import { useThemeConfig } from '../stores/themeStore'

// 등록(/board/new)과 수정(/board/:id/edit)을 같이 처리한다
export default function BoardFormPage() {
  const deco = useThemeConfig()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    getPost(id, { noView: true })
      .then((post) => {
        // 다른 사람의 글이면 수정할 수 없으므로 상세 화면으로 돌려보낸다
        if (!canEditPost(post, user)) {
          navigate(`/board/${id}`, { replace: true })
          return
        }
        setTitle(post.title)
        setContent(post.content)
        setIsPrivate(post.isPrivate)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, isEdit, user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('제목을 입력해 주세요.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const data = { title, content, isPrivate }
      const saved = isEdit ? await updatePost(id, data) : await createPost(data)
      navigate(`/board/${saved.id}`, { replace: true })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) return <p className="text-center text-ink/50">{deco.loading}</p>

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-8">
      <div>
        <h1 className="page-title">{isEdit ? '✏️ 게시글 수정' : '🌷 새 글 쓰기'}</h1>
        {!isEdit && <p className="mt-1 text-sm text-ink/60">글쓴이: <b>{user?.name}</b></p>}
      </div>
      <label className="block space-y-1">
        <span className="label">제목</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력해 주세요" className="input" />
      </label>
      <label className="block space-y-1">
        <span className="label">내용</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="오늘은 어떤 이야기를 나눠 볼까요?"
          rows={10}
          className="input resize-y"
        />
      </label>
      {error && <p className="alert-error">🥲 {error}</p>}
      {/* 등록 버튼 바로 위: 비공개 체크 */}
      <label
        className={`flex cursor-pointer items-center justify-end gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
          isPrivate ? 'bg-lavender/50 text-violet-700' : 'bg-soft/60 text-ink/70'
        }`}
      >
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="h-4 w-4 accent-violet-500"
        />
        🔒 비공개로 올리기
        <span className="font-normal text-ink/50">(운영자만 볼 수 있어요)</span>
      </label>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost">
          취소
        </button>
        <button type="submit" disabled={saving} className="btn btn-point">
          {saving ? '저장 중...' : isEdit ? `수정 완료 ${deco.heart}` : `등록하기 ${deco.heart}`}
        </button>
      </div>
    </form>
  )
}
