import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

// 실제 서버가 생기면 baseURL만 서버 주소로 바꾼다
const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
})

// 요청마다 로그인 토큰을 헤더에 붙인다
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401이면 로그아웃 처리, 오류 메시지는 서버가 준 message로 통일한다
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      useAuthStore.getState().logout()
    }
    const message = error.response?.data?.message || error.message || '요청 중 오류가 발생했습니다.'
    return Promise.reject(new Error(message))
  }
)

export default api
