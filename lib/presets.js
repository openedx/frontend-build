const path = require('path');
const paths = require('./paths');

const getConfigFilepath = filename =>
  path.resolve(paths.BASE_CONFIG_DIR, filename);

module.exports = {
  eslint: {
    globSearchPattern: '.eslintrc*',
    suggestedName: '.eslintrc.js',
    configFile: getConfigFilepath('.eslintrc.js'),
  },
  jest: {
    globSearchPattern: 'jest.config.js',
    suggestedName: 'jest.config.js',
    configFile: getConfigFilepath('jest.config.js'),
  },
  babel: {
    globSearchPattern: 'babel.config.js',
    suggestedName: 'babel.config.js',
    configFile: getConfigFilepath('babel.config.js'),
  },
  'webpack-prod': {
    globSearchPattern: 'webpack.prod.config.js',
    suggestedName: 'webpack.prod.config.js',
    configFile: getConfigFilepath('webpack.prod.config.js'),
  },
  'webpack-dev': {
    globSearchPattern: 'webpack.dev.config.js',
    suggestedName: 'webpack.dev.config.js',
    configFile: getConfigFilepath('webpack.dev.config.js'),
  },
};
