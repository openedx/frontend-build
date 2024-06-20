// This file will be removed and replace "eslintrc.js" once all MFEs are ready

module.exports = {
  plugins: ['formatjs'],
  extends: '@edx/eslint-config',
  parserOptions: {
    requireConfigFile: true,
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
    'formatjs/enforce-description': ['error', 'literal'],
    'import/no-import-module-export': 'off',
    'react/function-component-definition': [2, { namedComponents: 'arrow-function' }],
  },
  globals: {
    newrelic: false,
  },
  ignorePatterns: [
    'module.config.js',
  ],
};
