import api from '../utils/api'

// 빈 검색어는 보내지 않는다 (비어 있으면 전체 조회)
function cleanParams(params) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''))
}

/**
 * 게시글 목록 (page는 0부터)
 * @param {import('../utils/types').BoardSearchParams} params
 * @returns {Promise<import('../utils/types').Page<import('../utils/types').BoardSummaryResponse>>}
 */
export async function getBoards(params = {}) {
  const res = await api.get('/boards', { params: cleanParams(params) })
  return res.data
}

// 호출할 때마다 조회수가 1 오른다 → 화면에서 중복 호출하지 않도록 주의
/** @returns {Promise<import('../utils/types').BoardResponse>} */
export async function getBoard(id) {
  const res = await api.get(`/boards/${id}`)
  return res.data
}

/** @param {import('../utils/types').BoardRequest} board */
export async function createBoard(board) {
  const res = await api.post('/boards', board)
  return res.data
}

/** @param {import('../utils/types').BoardRequest} board */
export async function updateBoard(id, board) {
  const res = await api.put(`/boards/${id}`, board)
  return res.data
}

// 204 No Content: 응답 본문 없음
export async function deleteBoard(id) {
  await api.delete(`/boards/${id}`)
}
