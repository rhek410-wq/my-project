import api from '../utils/api'

export async function login(username, password) {
  const res = await api.post('/auth/login', { username, password })
  return res.data // { token, user }
}
