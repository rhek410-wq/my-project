import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deletePost, getPost, votePost } from '../service/postService'
import { useAuthStore } from '../stores/authStore'
import CommentSection from '../comp/CommentSection'
import VoteButtons from '../comp/VoteButtons'
import { canEditPost, formatDate } from '../utils/format'
import { useThemeConfig } from '../stores/themeStore'

export default function BoardDetailPage() {
  const deco = useThemeConfig()
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [post, setPost] = useState(null)
  const [error, setError] = useState('')
  const requested = useRef(false)

  useEffect(() => {
    // StrictMode에서 두 번 호출되어 조회수가 2 오르는 것을 막는다
    if (requested.current) return
    requested.current = true
    getPost(id)
      .then(setPost)
      .catch((err) => setError(err.message))
  }, [id])

  // 본인 글이거나 운영자일 때만 수정·삭제 버튼을 보여준다
  const canEdit = canEditPost(post, user)

  const handleDelete = async () => {
    if (!window.confirm('이 글을 삭제할까요?')) return
    try {
      await deletePost(id)
      navigate('/board', { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  if (error && !post)
    return (
      <div className="space-y-4">
        <p className="alert-error">{error === '비공개 글입니다.' ? '🔒 비공개 글입니다. 운영자와 글쓴이만 볼 수 있어요.' : `🥲 ${error}`}</p>
        <Link to="/board" className="btn btn-ghost">
          ← 목록
        </Link>
      </div>
    )
  if (!post) return <p className="text-center text-ink/50">{deco.loading}</p>

  return (
    <div className="space-y-5">
      <article className="card p-8">
        {post.isPrivate && (
          <p className="badge mb-2 bg-lavender/60 text-violet-700">🔒 비공개 글 · 운영자와 글쓴이만 볼 수 있어요</p>
        )}
        <h1 className="font-cute text-3xl">{post.title}</h1>
        <dl className="mt-4 flex flex-wrap gap-2 border-b-2 border-dashed border-line pb-4 text-xs">
          <div className="badge bg-soft text-point-dark"><dt className="inline">✍️ 글쓴이 </dt><dd className="inline">{post.authorName}</dd></div>
          <div className="badge bg-sun/60 text-orange-700"><dt className="inline">👀 조회수 </dt><dd className="inline">{post.views}</dd></div>
          <div className="badge bg-mint/40 text-emerald-700"><dt className="inline">🌱 등록일 </dt><dd className="inline">{formatDate(post.createdAt)}</dd></div>
          <div className="badge bg-lavender/60 text-violet-700"><dt className="inline">🔄 수정일 </dt><dd className="inline">{formatDate(post.updatedAt)}</dd></div>
        </dl>
        <p className="mt-6 min-h-40 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        <VoteButtons
          target={post}
          vote={(type) => votePost(post.id, type)}
          onChange={(result) => setPost((prev) => ({ ...prev, ...result }))}
        />
      </article>

      {error && <p className="alert-error">🥲 {error}</p>}

      <div className="flex justify-between">
        <Link to="/board" className="btn btn-ghost">
          ← 목록
        </Link>
        {canEdit && (
          <div className="flex gap-2">
            <Link to={`/board/${post.id}/edit`} className="btn btn-mint">
              ✏️ 수정
            </Link>
            <button onClick={handleDelete} className="btn btn-danger">
              🗑️ 삭제
            </button>
          </div>
        )}
      </div>

      <CommentSection postId={post.id} />
    </div>
  )
}
