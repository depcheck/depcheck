const { configs: eslintConfigs } = require('@eslint/js');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const pluginImport = require('eslint-plugin-import-x');
const mochaPlugin = require('eslint-plugin-mocha');
const globals = require('globals');

module.exports = [
  {
    ignores: ['test/fake_modules'],
  },
  {
    ...eslintConfigs.recommended,
    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  prettierRecommended,
  // TODO (43081j): drop the languageOptions once we know how to stop
  // the import plugin overriding them
  {
    ...pluginImport.flatConfigs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    rules: {
      'implicit-arrow-linebreak': 'off',
      'import-x/no-dynamic-require': 'off',
      'import-x/no-named-as-default': 'off',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  mochaPlugin.configs.flat.recommended,
  {
    files: ['test/**/*.js'],
    rules: {
      'mocha/no-mocha-arrows': 'off',
    },
    languageOptions: {
      globals: {
        ...globals.mocha,
        ...globals.node,
      },
    },
  },
];
