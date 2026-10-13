import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { THEMES } from '../utils/themes'

// 선택한 테마 (새로고침해도 유지)
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'sky',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'mock-board-theme' }
  )
)

// 현재 테마의 장식(마스코트, 하트, 문구 등)
export function useThemeConfig() {
  const theme = useThemeStore((s) => s.theme)
  return THEMES[theme] || THEMES.sky
}

// <html data-theme="..."> 에 반영해서 CSS 색을 바꾼다
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
}
applyTheme(useThemeStore.getState().theme)
useThemeStore.subscribe((s) => applyTheme(s.theme))
