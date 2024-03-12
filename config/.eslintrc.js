const fs = require('fs');
const path = require('path');
const { babel } = require('../lib/presets');

const defaultWebpackConfigPath = path.resolve(process.cwd(), './webpack.dev.config.js');
const webpackConfigPath = fs.existsSync(defaultWebpackConfigPath) ? defaultWebpackConfigPath : path.resolve(__dirname, './webpack.dev.config.js');

module.exports = {
  extends: '@edx/eslint-config',
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: true,
    babelOptions: {
      configFile: babel.resolvedFilepath || babel.defaultFilepath,
    },
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: webpackConfigPath,
      },
      alias: {
        map: [
          ['@root_path', path.resolve(process.cwd(), '.')],
        ],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      },
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
    'import/prefer-default-export': 'off',
  },
  overrides: [
    {
      files: ['**/plugins/**/*.jsx'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
  globals: {
    newrelic: false,
  },
  ignorePatterns: [
    'module.config.js',
  ],
};
