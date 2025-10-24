import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
     plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // common rules
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },

  // Admin-specific overrides
  {
    files: [ 'src/admin.tsx',
      'src/AdminApp.tsx',
      'src/components/admin/**/*.{ts,tsx}',
      'src/pages/admin/**/*.{ts,tsx}',], // only admin folder
    rules: {
      '@typescript-eslint/no-unused-vars': 'off', // admin exception
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
])
