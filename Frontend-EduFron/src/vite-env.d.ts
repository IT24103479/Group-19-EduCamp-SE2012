/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_API_BASE?: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}