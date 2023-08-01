/**
 * This webpack config is derived from the OpenEdx dev webpack config and is
 * used to bundle the Open Edx Piral shell. It removes babel and other loader
 * configs as those are not necessary for the simple layouts used in the shell.
 */

// This is the dev Webpack config. All settings here should prefer a fast build
// time at the expense of creating larger, unoptimized bundles.
const { merge } = require('webpack-merge');
const Dotenv = require('dotenv-webpack');
const dotenv = require('dotenv');
const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const commonConfig = require('./webpack.common.config');
const resolvePrivateEnvConfig = require('../lib/resolvePrivateEnvConfig');
const getLocalAliases = require('./getLocalAliases');

// Add process env vars. Currently used only for setting the
// server port and the publicPath
dotenv.config({
  path: path.resolve(process.cwd(), '.env.development'),
});

// Allow private/local overrides of env vars from .env.development for config settings
// that you'd like to persist locally during development, without the risk of checking
// in temporary modifications to .env.development.
resolvePrivateEnvConfig('.env.private');

const aliases = getLocalAliases();
const PUBLIC_PATH = process.env.PUBLIC_PATH || '/';
const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';

module.exports = merge(commonConfig, {
  // eslint-disable-next-line object-shorthand
  mode: mode,
  devtool: 'eval-source-map',
  output: {
    publicPath: PUBLIC_PATH,
  },
  resolve: {
    alias: aliases,
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },

  // Specify additional processing or side-effects done on the Webpack output bundles as a whole.
  plugins: [
    new Dotenv({
      path: path.resolve(process.cwd(), '.env.development'),
      systemvars: true,
    }),
    new ReactRefreshWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[chunkhash].css',
    }),
  ],
});
