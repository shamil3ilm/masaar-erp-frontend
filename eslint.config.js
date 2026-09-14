import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

// App source, minus the Vitest suites that build axios errors and fixtures by hand.
const APP_SOURCE = ['apps/*/src/**/*.{ts,tsx}']
const APP_TESTS = ['**/*.test.{ts,tsx}', '**/test/**']

const HTTP = 'Apps make HTTP calls through a hook or function exported by @masaar/api-client.'
const QUERY_HOOKS = 'Query and mutation hooks live in @masaar/api-client; import the hook from there.'

// The codes apps/staff/src/lib/money.ts lists, plus common ones that must not creep in.
const CURRENCY_CODES = 'SAR|AED|QAR|OMR|BHD|KWD|INR|USD|EUR|GBP|EGP|JOD'
const CURRENCY = 'Take the currency from the document or organization, or from apps/staff/src/lib/money.ts.'
const STEP = 'Use MoneyInput, moneyInputProps or quantityInputProps (apps/staff/src/lib/money.ts) for input steps.'

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
  {
    // All HTTP goes through @masaar/api-client: it owns the base URL, the token,
    // the refresh-on-401 and the error shape. Apps may call initApiClient in
    // main.tsx and the hooks, but not reach for a raw client.
    files: APP_SOURCE,
    ignores: APP_TESTS,
    rules: {
      '@typescript-eslint/no-restricted-imports': ['error', {
        paths: [
          { name: 'axios', message: HTTP },
          { name: '@masaar/api-client', importNames: ['getApiClient', 'createApiClient'], message: HTTP },
          {
            name: '@tanstack/react-query',
            importNames: [
              'useQuery', 'useQueries', 'useInfiniteQuery',
              'useSuspenseQuery', 'useSuspenseQueries', 'useSuspenseInfiniteQuery',
              'useMutation',
            ],
            message: QUERY_HOOKS,
          },
        ],
        patterns: [{ group: ['axios/*'], message: HTTP }],
      }],
      'no-restricted-globals': ['error',
        { name: 'fetch', message: HTTP },
        { name: 'XMLHttpRequest', message: HTTP },
      ],
      'no-restricted-properties': ['error',
        { object: 'window', property: 'fetch', message: HTTP },
        { object: 'globalThis', property: 'fetch', message: HTTP },
        { object: 'self', property: 'fetch', message: HTTP },
      ],
    },
  },
  {
    // Money follows the document's currency: no literal currency codes, no
    // literal decimal steps, and formatCurrency always gets the currency.
    // money.ts is the one place the codes and steps are written down.
    files: APP_SOURCE,
    ignores: [...APP_TESTS, 'apps/staff/src/lib/money.ts'],
    rules: {
      'no-restricted-syntax': ['error',
        { selector: `Literal[value=/^(${CURRENCY_CODES})$/]`, message: CURRENCY },
        { selector: `TemplateElement[value.raw=/^(${CURRENCY_CODES})$/]`, message: CURRENCY },
        { selector: `JSXText[value=/^\\s*(${CURRENCY_CODES})\\s*$/]`, message: CURRENCY },
        { selector: 'JSXAttribute[name.name="step"] > Literal[value!="any"]', message: STEP },
        { selector: 'JSXAttribute[name.name="step"] > JSXExpressionContainer > Literal[value!="any"]', message: STEP },
        { selector: 'Property[key.name="step"] > Literal[value!="any"]', message: STEP },
        {
          selector: 'CallExpression[callee.name="formatCurrency"][arguments.length<2]',
          message: 'Pass the currency to formatCurrency; it shows a bare number rather than guess one.',
        },
      ],
    },
  },
)
