// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/bpapi': {
        target: 'https://api.bigpara.hurriyet.com.tr',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/bpapi/, '')
      }
    }
  }
})
