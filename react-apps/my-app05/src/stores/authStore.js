import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 로그인 정보 (새로고침해도 유지)
export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: ({ token, user }) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'mock-board-auth' }
  )
)
