import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tsEslint from 'typescript-eslint';
import pluginTurbo from 'eslint-plugin-turbo';
import pluginImport from 'eslint-plugin-import-x';

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const baseConfig = [
  {
    name: '@fleetfox/eslint-config/base/ignores',
    ignores: [
      '**/.nx/**',
      '**/.svelte-kit/**',
      '**/build/**',
      '**/coverage/**',
      '**/dist/**',
      '**/snap/**',
      '**/vite.config.*.timestamp-*.*',
      '**/.vinxi/**',
      '**/.output/**',
      '**/.netlify/**',
    ],
  },
  js.configs.recommended,
  eslintConfigPrettier,
  ...tsEslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    plugins: {
      turbo: pluginTurbo,
    },
    rules: {
      'turbo/no-undeclared-env-vars': ['warn', { allowList: ['SSR', 'DEV'] }],
    },
  },
  {
    // Taken from TanStack Config
    plugins: {
      import: pluginImport,
    },
    rules: {
      /** Bans the use of inline type-only markers for named imports */
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      /** Reports any imports that come after non-import statements */
      'import/first': 'error',
      /** Stylistic preference */
      'import/newline-after-import': 'error',
      /** No require() or module.exports */
      'import/no-commonjs': 'error',
      /** No import loops */
      'import/no-cycle': 'error',
      /** Reports if a resolved path is imported more than once */
      'import/no-duplicates': 'error',
      /** Stylistic preference */
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
        },
      ],
    },
  },
];
