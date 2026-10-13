// ISO 날짜 문자열 → "2026-10-12 14:30"
export function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const ROLE_LABEL = {
  ADMIN: '운영자',
  USER: '사용자',
}

// 게시글 수정·삭제 권한: 운영자이거나 본인 글
export function canEditPost(post, user) {
  return Boolean(post && user && (user.role === 'ADMIN' || post.authorId === user.id))
}

export const ROLE_EMOJI = {
  ADMIN: '👑',
  USER: '🐣',
}

// 댓글 수정: 본인만 / 댓글 삭제: 본인 또는 운영자
export function canEditComment(comment, user) {
  return Boolean(user && comment.authorId === user.id)
}

export function canDeleteComment(comment, user) {
  return Boolean(user && (user.role === 'ADMIN' || comment.authorId === user.id))
}
