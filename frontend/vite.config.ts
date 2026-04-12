import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: true,
    allowedHosts: ['.trycloudflare.com', '.cloudflare.com'],
    proxy: {
      // API 请求代理到后端
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
