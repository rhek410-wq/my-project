import api from '../utils/api'

export async function getComments(postId) {
  const res = await api.get(`/posts/${postId}/comments`)
  return res.data
}

export async function createComment(postId, content) {
  const res = await api.post(`/posts/${postId}/comments`, { content })
  return res.data
}

export async function updateComment(id, content) {
  const res = await api.put(`/comments/${id}`, { content })
  return res.data
}

export async function deleteComment(id) {
  await api.delete(`/comments/${id}`)
}

// 댓글 추천('up')·비추천('down'). 같은 값을 다시 보내면 취소된다 → { likes, dislikes, myVote }
export async function voteComment(id, type) {
  const res = await api.post(`/comments/${id}/vote`, { type })
  return res.data
}
