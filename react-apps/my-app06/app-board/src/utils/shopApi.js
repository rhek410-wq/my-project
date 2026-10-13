import axios from 'axios'
import { ApiError } from './api'
import { setupMockServer } from './mock/server'

// 상품 API 전용 클라이언트. 서버에 아직 상품 API가 없어서 mock adapter가 응답한다.
// 실제 상품 API가 생기면 .env 에 VITE_USE_PRODUCT_MOCK=false 로 끄면 된다 (화면·서비스 코드는 그대로).
const shopApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

shopApi.interceptors.response.use(
  (res) => res,
  (error) => {
    const data = error.response?.data
    return Promise.reject(
      new ApiError({
        status: error.response?.status,
        code: data?.code || (error.response ? 'UNKNOWN' : 'NETWORK_ERROR'),
        message: data?.message || (error.response ? '요청 중 오류가 발생했습니다.' : '서버에 연결할 수 없습니다.'),
      })
    )
  }
)

if (import.meta.env.VITE_USE_PRODUCT_MOCK !== 'false') setupMockServer(shopApi)

export default shopApi
