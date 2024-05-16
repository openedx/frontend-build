const path = require('path');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');

const ParagonWebpackPlugin = require('../lib/plugins/paragon-webpack-plugin/ParagonWebpackPlugin');
const {
  getParagonThemeCss,
  getParagonCacheGroups,
  getParagonEntryPoints,
} = require('./data/paragonUtils');

const paragonThemeCss = getParagonThemeCss(process.cwd());
const brandThemeCss = getParagonThemeCss(process.cwd(), { isBrandOverride: true });

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
    /**
     * The entry points for the brand theme CSS. Example: ```
     * {
     *   "paragon.theme.core": "/path/to/node_modules/@edx/brand/dist/core.min.css",
     *   "paragon.theme.variants.light": "/path/to/node_modules/@edx/brand/dist/light.min.css"
     * }
     */
    ...getParagonEntryPoints(brandThemeCss),
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
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        ...getParagonCacheGroups(paragonThemeCss),
        ...getParagonCacheGroups(brandThemeCss),
      },
    },
  },
  plugins: [
    new RemoveEmptyScriptsPlugin(),
    new ParagonWebpackPlugin(),
  ],
  ignoreWarnings: [
    // Ignore warnings raised by source-map-loader.
    // some third party packages may ship miss-configured sourcemaps, that interrupts the build
    // See: https://github.com/facebook/create-react-app/discussions/11278#discussioncomment-1780169
    /**
     *
     * @param {import('webpack').WebpackError} warning
     * @returns {boolean}
     */
    function ignoreSourcemapsloaderWarnings(warning) {
      return (
        warning.module
        && warning.module.resource.includes('node_modules')
        && warning.details
        && warning.details.includes('source-map-loader')
      );
    },
  ],
};
