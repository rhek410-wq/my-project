import api from '../utils/api'

export async function getPosts() {
  const res = await api.get('/posts')
  return res.data
}

// noView: 수정 화면처럼 조회수를 올리지 않고 불러올 때 사용
export async function getPost(id, { noView = false } = {}) {
  const res = await api.get(`/posts/${id}`, { params: noView ? { noView: true } : undefined })
  return res.data
}

export async function createPost(post) {
  const res = await api.post('/posts', post)
  return res.data
}

export async function updatePost(id, post) {
  const res = await api.put(`/posts/${id}`, post)
  return res.data
}

export async function deletePost(id) {
  await api.delete(`/posts/${id}`)
}

// 추천('up')·비추천('down'). 같은 값을 다시 보내면 취소된다 → { likes, dislikes, myVote }
export async function votePost(id, type) {
  const res = await api.post(`/posts/${id}/vote`, { type })
  return res.data
}
