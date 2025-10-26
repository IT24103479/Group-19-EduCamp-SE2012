import { defineConfig, loadEnv } from "vite";
import type {Plugin }from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import history from "connect-history-api-fallback";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// plugin that installs the connect-history-api-fallback middleware in dev
function spaFallbackPlugin(): Plugin {
  return {
    name: "spa-fallback",
    configureServer(server) {
      server.middlewares.use(
        // rewrite all non-static requests to index.html so SPA routes work
        history({
          rewrites: [{ from: /.*/, to: "/index.html" }],
        })
      );
    },
  };
}

export default ({ mode = "development" } = {}) => {
  // load only VITE_ prefixed env vars for the current mode
  const env = loadEnv(mode, process.cwd(), "VITE_");

  // default to your Railway production backend if no env set
  // trim any trailing slash to avoid double-slash when proxying
  const BACKEND_URL =
    (env.VITE_BACKEND_URL || "https://group-19-educamp-se2012-production.up.railway.app/").replace(
      /\/$/,
      ""
    );
  return defineConfig({
    plugins: [react(), spaFallbackPlugin()],

    build: {
      rollupOptions: {
        // single-page app — only index.html as entry
        input: {
          main: resolve(__dirname, "index.html"),
        },
      },
    },

    server: {
      allowedHosts: true,
      fs: { allow: ["."] },
      proxy: {
        // proxy API requests to the resolved BACKEND_URL
        // target must be a resolved URL (not the literal env var name)
        "/classes": { target: BACKEND_URL, changeOrigin: true, secure: false },
        "/students": { target: BACKEND_URL, changeOrigin: true, secure: false },
        "/api/payments": { target: BACKEND_URL, changeOrigin: true, secure: false },
        "/api/enrollments": { target: BACKEND_URL, changeOrigin: true, secure: false },
      },
    },

    optimizeDeps: {},

    esbuild: {
      logOverride: { "ignored-directive": "silent" },
    },

    logLevel: "info",
  });
};