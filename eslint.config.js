import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

/**
 * One config for the whole workspace.
 *
 * Every package used to declare `lint: eslint .` and carry its own
 * create-vite config, and eslint was installed nowhere — so the command
 * failed on invocation in all six. A single config at the root lints the
 * apps and the packages together, which also sidesteps pnpm's hoisting:
 * with shamefully-hoist=false a package cannot see a root devDependency,
 * so a per-package eslint would have to be installed six times.
 */
export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/*.config.js',
      '**/*.config.ts',
    ],
  },
  {
    // No `files` key on purpose: this has to reach every config below,
    // including the ones tseslint contributes. Four tsconfigs sit above any
    // given source file here — the root and one per app — and the parser will
    // not guess between them.
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // Playwright specs, Vitest suites and the screenshot script run in Node
    // and also evaluate code inside a page, so they see both sets of globals.
    files: ['**/e2e/**/*.ts', '**/*.test.{ts,tsx}', '**/test/**/*.ts', '**/*.mjs'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    // An entry point mounts the app and exports nothing, which is what the
    // rule complains about. There is nothing above it to hot-swap into, so
    // fast refresh does not apply to it in the first place.
    files: ['**/main.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
)
