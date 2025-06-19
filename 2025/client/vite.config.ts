import { defineConfig, loadEnv, ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd());

  return defineConfig({
    plugins: [react()],
    define: {
      __VITE_API_URL__: JSON.stringify(env.VITE_API_URL),
      __VITE_AUTH0_DOMAIN__: JSON.stringify(env.VITE_AUTH0_DOMAIN),
      __VITE_AUTH0_CLIENT_ID__: JSON.stringify(env.VITE_AUTH0_CLIENT_ID),
      __VITE_AUTH0_REDIRECT_URI__: JSON.stringify(env.VITE_AUTH0_REDIRECT_URI)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
      }
    }
  });
};
