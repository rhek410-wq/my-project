import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getTokenExpiry } from '../utils/jwt'

// 로그인 정보 (새로고침해도 유지)
// token: accessToken / userId: 로그인한 아이디(JWT sub) / user: 회원 상세(UserResponse, 화면 표시용)
export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      userId: null,
      user: null,
      login: ({ token, userId }) => set({ token, userId, user: null }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, userId: null, user: null }),
    }),
    {
      name: 'app-board-auth',
      // 새로고침했을 때 이미 만료된 토큰이면 지운다 (유효시간 1시간, refresh 없음)
      onRehydrateStorage: () => (state) => {
        const exp = state?.token && getTokenExpiry(state.token)
        if (exp && exp <= Date.now()) state.logout()
      },
    }
  )
)
