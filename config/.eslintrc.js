const { babel } = require('../lib/presets');

module.exports = {
  extends: ['@edx/eslint-config'],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    requireConfigFile: true,
    babelOptions: {
      configFile: babel.resolvedFilepath || babel.defaultFilepath,
    },
  },
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.config.*',
          '**/*.test.*',
          '**/setupTest.js',
        ],
      },
    ],
    'import/no-unresolved': [
      'error',
      {
        ignore: [
          'env.config',
        ],
      },
    ],
    // https://github.com/evcohen/eslint-plugin-jsx-a11y/issues/340#issuecomment-338424908
    'jsx-a11y/anchor-is-valid': ['error', {
      components: ['Link'],
      specialLink: ['to'],
    }],
    'import/no-import-module-export': 'off',
    'react/function-component-definition': [2, { namedComponents: 'arrow-function' }],
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  globals: {
    newrelic: false,
    PARAGON_THEME: false,
  },
  ignorePatterns: [
    'module.config.js',
    'env.config.*',
  ],
};
