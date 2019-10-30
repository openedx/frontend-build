const path = require('path');
const paths = require('./paths');

const getConfigFilepath = filename =>
  path.resolve(paths.BASE_CONFIG_DIR, filename);

module.exports = {
  eslint: {
    globSearchPattern: '.eslintrc*',
    configFile: getConfigFilepath('.eslintrc.js'),
  },
  jest: {
    globSearchPattern: 'jest.config.js',
    configFile: getConfigFilepath('jest.config.js'),
  },
  babel: {
    globSearchPattern: '(babel.config.js|.babelrc*)',
    configFile: getConfigFilepath('babel.config.js'),
  },
  'babel-preserve-modules': {
    globSearchPattern: '(babel.config.js|.babelrc*)',
    configFile: getConfigFilepath('babel-preserve-modules.config.js'),
  },
  'webpack-prod': {
    globSearchPattern: 'webpack.prod.config.js',
    configFile: getConfigFilepath('webpack.prod.config.js'),
  },
  'webpack-dev': {
    globSearchPattern: 'webpack.dev.config.js',
    configFile: getConfigFilepath('webpack.dev.config.js'),
  },
  'webpack-dev-stage': {
    globSearchPattern: 'webpack.dev-stage.config.js',
    configFile: getConfigFilepath('webpack.dev-stage.config.js'),
  },
};
