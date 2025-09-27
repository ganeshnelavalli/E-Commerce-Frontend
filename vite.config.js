import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://e-commerce-backend-3ccf.onrender.com/api/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})


