import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://e-commerce-backend-3ccf.onrender.com'
  : 'http://127.0.0.1:8000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: API_BASE_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    // Make API URL available in the client code
    __API_BASE_URL__: JSON.stringify(API_BASE_URL),
  },
})


