import api from '../utils/api'

/** @param {import('../utils/types').SignupRequest} data @returns {Promise<import('../utils/types').UserResponse>} */
export async function signup(data) {
  const res = await api.post('/auth/signup', data)
  return res.data
}

/** @returns {Promise<import('../utils/types').LoginResponse>} */
export async function login(userId, password) {
  const res = await api.post('/auth/login', { userId, password })
  return res.data // { accessToken, tokenType }
}
