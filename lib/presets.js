const ConfigPreset = require('./ConfigPreset');

const searchFilepaths = [process.cwd()];

const babel = new ConfigPreset({
  defaultFilename: 'babel.config.js',
  searchFilenames: ['.babelrc', '.babelrc.js', 'babel.config.js'],
  searchFilepaths,
});

const formatjs = new ConfigPreset({
  defaultFilename: 'babel.config.js',
  searchFilenames: ['.babelrc', '.babelrc.js', 'babel.config.js'],
  searchFilepaths,
});

const babelPreserveModules = new ConfigPreset({
  defaultFilename: 'babel-preserve-modules.config.js',
  searchFilenames: ['.babelrc', '.babelrc.js', 'babel.config.js'],
  searchFilepaths,
});

const babelTypescript = new ConfigPreset({
  defaultFilename: 'babel-typescript.config.js',
  searchFilenames: ['babel-typescript.config.js', '.babelrc', '.babelrc.js', 'babel.config.js'],
  searchFilepaths,
});

const eslint = new ConfigPreset({
  defaultFilename: '.eslintrc.js',
  searchFilenames: ['.eslintrc', '.eslintrc.js'],
  searchFilepaths,
});

const jest = new ConfigPreset({
  defaultFilename: 'jest.config.js',
  searchFilenames: ['jest.config.js'],
  searchFilepaths,
});

const webpackDevServer = new ConfigPreset({
  defaultFilename: 'webpack.dev.config.js',
  searchFilenames: ['webpack.dev.config.js'],
  searchFilepaths,
});

const webpackDevServerStage = new ConfigPreset({
  defaultFilename: 'webpack.dev-stage.config.js',
  searchFilenames: ['webpack.dev-stage.config.js'],
  searchFilepaths,
});

const webpack = new ConfigPreset({
  defaultFilename: 'webpack.prod.config.js',
  searchFilenames: ['webpack.prod.config.js'],
  searchFilepaths,
});

module.exports = {
  babel,
  formatjs,
  babelPreserveModules,
  'babel-preserve-modules': babelPreserveModules,
  'babel-typescript': babelTypescript,
  eslint,
  jest,
  webpack,
  webpackDevServer,
  'webpack-dev': webpackDevServer,
  'webpack-dev-server': webpackDevServer,
  webpackDevServerStage,
  'webpack-dev-server-stage': webpackDevServerStage,
  'webpack-dev-stage': webpackDevServerStage,
  'webpack-prod': webpack,
};
