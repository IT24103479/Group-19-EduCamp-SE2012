import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  
  // Allow all hosts for dev server (useful for remote devices)
  server: {
    allowedHosts: true,
  },

  // Suppress specific esbuild warnings
  esbuild: {
    logOverride: {
      'ignored-directive': 'silent', 
    },
  },

  // Set log level
  logLevel: 'info', 

  // Custom Rollup build warning handling
  build: {
    rollupOptions: {
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
});
