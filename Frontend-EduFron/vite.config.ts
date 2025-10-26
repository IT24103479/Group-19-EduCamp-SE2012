import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import history from 'connect-history-api-fallback';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default ({ mode }) => {
  // load .env, .env.production, etc.
  const env = loadEnv(mode, process.cwd(), 'VITE_'); // only VITE_ vars
  const BACKEND_URL = env.VITE_BACKEND_URL || 'http://localhost:8081';

  return defineConfig({
    plugins: [react()],
    configureServer(server) {
      server.middlewares.use(
        history({ rewrites: [{ from: /^\/admin(?:\/.*)?$/, to: '/admin.html' }, { from: /^\/.*$/, to: '/index.html' }] })
      );
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          admin: resolve(__dirname, 'admin.html'),
        },
      },
    },
    server: {
      proxy: {
        '/classes': { target: BACKEND_URL, changeOrigin: true, secure: false },
        '/students': { target: BACKEND_URL, changeOrigin: true, secure: false },
        '/api/payments': { target: BACKEND_URL, changeOrigin: true, secure: false },
        '/api/enrollments': { target: BACKEND_URL, changeOrigin: true, secure: false },
      },
    },
  });
};