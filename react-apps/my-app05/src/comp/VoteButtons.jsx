import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

// 추천·비추천 버튼 (게시글·댓글 공통, 다른 사람의 것에만 누를 수 있다)
// target: { authorId, likes, dislikes, myVote } / vote(type): 서버 요청 함수 / onChange: 결과 반영
export default function VoteButtons({ target, vote, onChange, small = false }) {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const location = useLocation()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const isMine = user && target.authorId === user.id

  const handleVote = async (type) => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    setBusy(true)
    setError('')
    try {
      onChange(await vote(type))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const buttons = [
    { type: 'up', emoji: '👍', label: '추천', count: target.likes, on: 'border-point bg-soft text-point-dark' },
    { type: 'down', emoji: '👎', label: '비추천', count: target.dislikes, on: 'border-violet-300 bg-lavender/50 text-violet-700' },
  ]

  const row = (
    <div className={`flex ${small ? 'gap-1.5' : 'gap-3'}`}>
      {buttons.map((b) => (
        <button
          key={b.type}
          onClick={() => handleVote(b.type)}
          disabled={busy || isMine}
          aria-pressed={target.myVote === b.type}
          aria-label={`${b.label} ${b.count}`}
          title={isMine ? '내 글에는 누를 수 없어요' : b.label}
          className={`btn border-2 ${small ? 'btn-sm' : 'px-6 py-2.5 text-base'} ${
            target.myVote === b.type ? b.on : 'border-line bg-surface text-ink/70 hover:bg-soft'
          } ${isMine ? 'disabled:opacity-60' : ''}`}
        >
          <span className={small ? '' : 'text-xl'}>{b.emoji}</span>
          {!small && ` ${b.label}`} <b>{b.count}</b>
        </button>
      ))}
    </div>
  )

  // 댓글용 작은 버튼은 안내 문구 없이 버튼만
  if (small) {
    return (
      <div className="flex items-center gap-2">
        {row}
        {error && <span className="text-xs text-rose-500">🥲 {error}</span>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2 pt-2">
      {row}
      {isMine && <p className="text-xs text-ink/50">내 글에는 추천·비추천을 할 수 없어요</p>}
      {!user && <p className="text-xs text-ink/50">로그인하면 추천·비추천을 할 수 있어요</p>}
      {error && <p className="text-xs text-rose-500">🥲 {error}</p>}
    </div>
  )
}
