import api from '../utils/api'

/**
 * 회원 목록 (userId 오름차순 고정, page는 0부터)
 * @param {{ page?: number, size?: number, keyword?: string }} params
 * @returns {Promise<import('../utils/types').Page<import('../utils/types').UserResponse>>}
 */
export async function getUsers({ page = 0, size = 10, keyword } = {}) {
  const res = await api.get('/users', { params: { page, size, ...(keyword ? { keyword } : {}) } })
  return res.data
}

/** @returns {Promise<import('../utils/types').UserResponse>} */
export async function getUser(userId) {
  const res = await api.get(`/users/${encodeURIComponent(userId)}`)
  return res.data
}

/** 본인만 가능. password는 바꿀 때만 넣는다 @param {import('../utils/types').UserUpdateRequest} data */
export async function updateUser(userId, data) {
  const res = await api.put(`/users/${encodeURIComponent(userId)}`, data)
  return res.data
}

// 본인만 가능. 204 No Content. 작성한 게시글도 함께 삭제된다
export async function deleteUser(userId) {
  await api.delete(`/users/${encodeURIComponent(userId)}`)
}
