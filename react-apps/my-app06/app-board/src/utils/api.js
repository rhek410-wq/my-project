import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

// 서버 오류를 { status, code, message } 로 통일한다. 화면은 message를 보여주고 분기는 code로 한다.
export class ApiError extends Error {
  constructor({ status, code, message }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

// VITE_API_BASE_URL이 비어 있으면 상대경로(/api/v1)로 호출 → vite 프록시가 서버로 넘긴다
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// 요청마다 로그인 토큰을 헤더에 붙인다
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    const data = error.response?.data
    const code = data?.code || (error.response ? 'UNKNOWN' : 'NETWORK_ERROR')
    const message =
      data?.message || (error.response ? '요청 중 오류가 발생했습니다.' : '서버에 연결할 수 없습니다.')

    // 토큰 없음/만료/위조 → 토큰을 지우고 로그인 화면으로 보낸다
    if (code === 'AUTH_REQUIRED') {
      useAuthStore.getState().logout()
      if (window.location.pathname !== '/login') {
        const from = window.location.pathname + window.location.search
        window.location.assign(`/login?expired=1&from=${encodeURIComponent(from)}`)
      }
    }

    return Promise.reject(new ApiError({ status, code, message }))
  }
)

export default api
