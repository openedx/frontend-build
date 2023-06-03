const path = require('path');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');

const ParagonWebpackPlugin = require('../lib/plugins/paragon-webpack-plugin/ParagonWebpackPlugin');
const {
  getParagonThemeCss,
  getParagonCacheGroups,
  getParagonEntryPoints,
} = require('./data/paragonUtils');

const paragonThemeCss = getParagonThemeCss(process.cwd());

module.exports = {
  entry: {
    app: path.resolve(process.cwd(), './src/index'),
    /**
     * The entry points for the Paragon theme CSS. Example: ```
     * {
     *   "paragon.theme.core": "/path/to/node_modules/@edx/paragon/dist/core.min.css",
     *   "paragon.theme.variants.light": "/path/to/node_modules/@edx/paragon/dist/light.min.css"
     * }
     */
    ...getParagonEntryPoints(paragonThemeCss),
  },
  output: {
    path: path.resolve(process.cwd(), './dist'),
    publicPath: '/',
  },
  resolve: {
    alias: {
      'env.config': path.resolve(process.cwd(), './env.config'),
    },
    fallback: {
      // This causes the system to return an empty object if it can't find an env.config.js file in
      // the application being built.
      'env.config': false,
    },
    extensions: ['.js', '.jsx'],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        ...getParagonCacheGroups(paragonThemeCss),
      },
    },
  },
  plugins: [
    new RemoveEmptyScriptsPlugin(),
    new ParagonWebpackPlugin(),
  ],
};
