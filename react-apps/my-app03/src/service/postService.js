import api from '../utils/api'

// 게시글 목록 조회 (GET)
export async function getPosts(limit = 10) {
  const res = await api.get('/posts', { params: { _limit: limit } })
  return res.data
}

// 게시글 단건 조회 (GET)
export async function getPost(id) {
  const res = await api.get(`/posts/${id}`)
  return res.data
}

// 게시글 등록 (POST)
export async function createPost(post) {
  const res = await api.post('/posts', post)
  return res.data
}

// 게시글 삭제 (DELETE)
export async function deletePost(id) {
  await api.delete(`/posts/${id}`)
  return id
}
