import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore
import path from 'path' // нужно импортировать path

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve('./src'), // Убедитесь, что путь правильный
    },
  },
  server: {
    port: 5173, // Порт вашего React-приложения
    proxy: {
      '/api': { // Проксируем все запросы, начинающиеся с /api
        target: 'http://localhost:5000', // Адрес вашего Go бэкенда
        changeOrigin: true,
      },
      '/auth': { // Также проксируем /auth для единообразия
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
