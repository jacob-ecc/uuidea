import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/', '.astro/', 'node_modules/', 'test-results/', 'playwright-report/'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...astro.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // strictest-TS (noUncheckedIndexedAccess): '!' bei geprüften Index-Zugriffen ist ok
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Spiele & Seed: Zufall NUR aus dem seeded PRNG.
    files: ['src/games/**', 'src/lib/seed/**'],
    rules: {
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Nutze den seeded Rng aus src/lib/seed.' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "MemberExpression[object.name='crypto'][property.name=/^(getRandomValues|randomUUID)$/]",
          message: 'Spiele dürfen keinen echten Zufall nutzen – nur den seeded Rng.',
        },
      ],
    },
  },
);
