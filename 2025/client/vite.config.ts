import {ConfigEnv, defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore
import path from 'path'

const env = loadEnv(process.cwd(), '');

export default ({ mode }:ConfigEnv) => {

  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    plugins: [react()],
    define: {
      'process.env': env,
    },
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
        '/auth': {
          target:  env.VITE_API_URL,
          changeOrigin: true,
        }
      }
    }
  })

};
