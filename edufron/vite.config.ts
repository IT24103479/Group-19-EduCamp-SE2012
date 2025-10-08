import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "url";
import {dirname ,resolve } from "path";
import history from 'connect-history-api-fallback';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
   name: "spa-fallback",
      configureServer(server) {
        server.middlewares.use(
          history({
            rewrites: [
              { from: /^\/admin(?:\/.*)?$/, to: "/admin.html" }, // matches /admin, /admin/, /admin/anything
  { from: /^\/.*$/, to: "/index.html" },
            ],
          })
        );
      },

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),     // main app
        admin: resolve(__dirname, 'admin.html'),    // admin app
      },
      onwarn(warning, warn) {
        // Ignore harmless warnings
        if (
          warning.message.includes('Module level directives') ||
          warning.message.includes('"use client"')  ||
          warning.message.includes('"was ignored"')
        ) {
          return; 
        }

        // Fail build on unresolved imports
        if (warning.code === 'UNRESOLVED_IMPORT') {
          throw new Error(`Build failed due to unresolved import:\n${warning.message}`);
        }

        // Fail build on missing exports
        if (warning.code === 'PLUGIN_WARNING' && /is not exported/.test(warning.message)) {
          throw new Error(`Build failed due to missing export:\n${warning.message}`);
        }

        // Other warnings: log normally
        warn(warning);
      },
    },
  },

  // Allow all hosts for dev server (useful for remote devices)
  server: {
    allowedHosts: true,
    
     fs: {
      allow: ['.'],
    },
    proxy: {},

    
  },
  // 👇 crucial part
  optimizeDeps: {},

  // Suppress specific esbuild warnings
  esbuild: {
    logOverride: {
      'ignored-directive': 'silent', 
    },
  },

  // Set log level
  logLevel: 'info', 
});
