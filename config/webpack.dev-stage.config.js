// This is the dev Webpack config. All settings here should prefer a fast build
// time at the expense of creating larger, unoptimized bundles.
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

const { merge } = require('webpack-merge');
const Dotenv = require('dotenv-webpack');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const PostCssAutoprefixerPlugin = require('autoprefixer');
const PostCssRTLCSS = require('postcss-rtlcss');
const PostCssCustomMediaCSS = require('postcss-custom-media');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const commonConfig = require('./webpack.common.config');
const presets = require('../lib/presets');
const resolvePrivateEnvConfig = require('../lib/resolvePrivateEnvConfig');
const getLocalAliases = require('./getLocalAliases');

// Add process env vars. Currently used only for setting the
// server port and the publicPath
dotenv.config({
  path: path.resolve(process.cwd(), '.env.development-stage'),
});

// Allow private/local overrides of env vars from .env.development for config settings
// that you'd like to persist locally during development, without the risk of checking
// in temporary modifications to .env.development.
resolvePrivateEnvConfig('.env.private');

const aliases = getLocalAliases();
const PUBLIC_PATH = process.env.PUBLIC_PATH || '/';

module.exports = merge(commonConfig, {
  mode: 'development',
  devtool: 'eval-source-map',
  output: {
    publicPath: PUBLIC_PATH,
  },
  resolve: {
    alias: aliases,
  },
  module: {
    // Specify file-by-file rules to Webpack. Some file-types need a particular kind of loader.
    rules: [
      // The babel-loader transforms newer ES2015+ syntax to older ES5 for older browsers.
      // Babel is configured with the .babelrc file at the root of the project.
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules\/(?!@(open)?edx)/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: presets.babel.resolvedFilepath,
            // Caches result of loader to the filesystem. Future builds will attempt to read
            // from the cache to avoid needing to run the expensive recompilation process
            // on each run.
            cacheDirectory: true,
            plugins: [
              require.resolve('react-refresh/babel'),
            ],
          },
        },
      },
      // We are not extracting CSS from the javascript bundles in development because extracting
      // prevents hot-reloading from working, it increases build time, and we don't care about
      // flash-of-unstyled-content issues in development.
      {
        test: /(.scss|.css)$/,
        use: [
          'style-loader', // creates style nodes from JS strings
          {
            loader: 'css-loader', // translates CSS into CommonJS
            options: {
              sourceMap: true,
              modules: {
                compileType: 'icss',
              },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  PostCssAutoprefixerPlugin(),
                  PostCssRTLCSS(),
                  PostCssCustomMediaCSS(),
                ],
              },
            },
          },
          'resolve-url-loader',
          {
            loader: 'sass-loader', // compiles Sass to CSS
            options: {
              sourceMap: true,
              sassOptions: {
                includePaths: [
                  path.join(process.cwd(), 'node_modules'),
                  path.join(process.cwd(), 'src'),
                ],
                // silences compiler warnings regarding deprecation warnings
                quietDeps: true,
              },
            },
          },
        ],
      },
      {
        test: /.svg(\?v=\d+\.\d+\.\d+)?$/,
        issuer: /\.jsx?$/,
        use: ['@svgr/webpack'],
      },
      // Webpack, by default, uses the url-loader for images and fonts that are required/included by
      // files it processes, which just base64 encodes them and inlines them in the javascript
      // bundles. This makes the javascript bundles ginormous and defeats caching so we will use the
      // file-loader instead to copy the files directly to the output directory.
      {
        test: /\.(woff2?|ttf|svg|eot)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
      },
      {
        test: /favicon.ico$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]', // <-- retain original file name
        },
      },
      {
        test: /\.(jpe?g|png|gif)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
      },
    ],
  },
  optimization: {
    minimizer: [
      '...',
      new ImageMinimizerPlugin({
        implementation: ImageMinimizerPlugin.sharpMinify,
        options: {
          encodeOptions: {
            ...['png', 'jpeg', 'jpg'].reduce((accumulator, value) => (
              { ...accumulator, [value]: { progressive: true, quality: 65 } }
            ), {}),
            gif: {
              effort: 5,
            },
          },
        },
      }),
    ],
  },
  // Specify additional processing or side-effects done on the Webpack output bundles as a whole.
  plugins: [
    // Generates an HTML file in the output directory.
    new HtmlWebpackPlugin({
      inject: true, // Appends script tags linking to the webpack bundles at the end of the body
      template: path.resolve(process.cwd(), 'public/index.html'),
      chunks: ['app'],
      FAVICON_URL: process.env.FAVICON_URL || null,
      OPTIMIZELY_PROJECT_ID: process.env.OPTIMIZELY_PROJECT_ID || null,
      NODE_ENV: process.env.NODE_ENV || null,
    }),
    new Dotenv({
      path: path.resolve(process.cwd(), '.env.development-stage'),
      systemvars: true,
    }),
    new ReactRefreshWebpackPlugin(),
  ],
  // This configures webpack-dev-server which serves bundles from memory and provides live
  // reloading.
  devServer: {
    host: '0.0.0.0',
    port: process.env.PORT || 8080,
    https: true,
    historyApiFallback: {
      index: path.join(PUBLIC_PATH, 'index.html'),
      disableDotRule: true,
    },
    // Enable hot reloading server. It will provide WDS_SOCKET_PATH endpoint
    // for the WebpackDevServer client so it can learn when the files were
    // updated. The WebpackDevServer client is included as an entry point
    // in the webpack development configuration. Note that only changes
    // to CSS are currently hot reloaded. JS changes will refresh the browser.
    hot: true,
    webSocketServer: 'ws',
    devMiddleware: {
      publicPath: PUBLIC_PATH,
    },
  },
});
