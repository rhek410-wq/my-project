import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    open: true,
    // 서버에 CORS 설정이 없어서 개발 중에는 프록시로 우회한다
    proxy: {
      '/api': { target: 'http://222.239.249.197:8080', changeOrigin: true },
    },
  },
})
