// This is the dev Webpack config. All settings here should prefer a fast build
// time at the expense of creating larger, unoptimized bundles.

const Merge = require('webpack-merge');
const path = require('path');
const dotenv = require('dotenv');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const PostCssRtlPlugin = require('postcss-rtl');

const commonConfig = require('./webpack.common.config.js');
const getProjectConfigFile = require('../lib/getProjectConfigFile');

const appDir = process.cwd();

// Add process env vars. Currently used only for setting the server port
dotenv.config({
  path: path.resolve(appDir, '.env.development'),
});

module.exports = Merge.smart(commonConfig, {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: {
    // enable react's custom hot dev client so we get errors reported in the browser
    hot: require.resolve('react-dev-utils/webpackHotDevClient'),
    app: path.resolve(appDir, 'src/index'),
  },
  module: {
    // Specify file-by-file rules to Webpack. Some file-types need a particular kind of loader.
    rules: [
      // The babel-loader transforms newer ES2015+ syntax to older ES5 for older browsers.
      // Babel is configured with the .babelrc file at the root of the project.
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: getProjectConfigFile(appDir, 'babel'),
            // Caches result of loader to the filesystem. Future builds will attempt to read from the
            // cache to avoid needing to run the expensive recompilation process on each run.
            cacheDirectory: true,
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
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [PostCssRtlPlugin()],
            },
          },
          'resolve-url-loader',
          {
            loader: 'sass-loader', // compiles Sass to CSS
            options: {
              sourceMap: true,
              includePaths: [
                path.join(appDir, 'node_modules'),
                path.join(appDir, 'src'),
              ],
            },
          },
        ],
      },
      {
        test: /.svg$/,
        issuer: {
          test: /\.jsx?$/,
        },
        loader: '@svgr/webpack',
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
        test: /\.(jpe?g|png|gif|ico)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              optimizationlevel: 7,
              mozjpeg: {
                progressive: true,
              },
              gifsicle: {
                interlaced: false,
              },
              pngquant: {
                quality: '65-90',
                speed: 4,
              },
            },
          },
        ],
      },
    ],
  },
  // Specify additional processing or side-effects done on the Webpack output bundles as a whole.
  plugins: [
    // Generates an HTML file in the output directory.
    new HtmlWebpackPlugin({
      inject: true, // Appends script tags linking to the webpack bundles at the end of the body
      template: path.resolve(appDir, 'public/index.html'),
    }),
    new Dotenv({
      path: path.resolve(appDir, '.env.development'),
    }),
    // when the --hot option is not passed in as part of the command
    // the HotModuleReplacementPlugin has to be specified in the Webpack configuration
    // https://webpack.js.org/configuration/dev-server/#devserver-hot
    new webpack.HotModuleReplacementPlugin(),
  ],
  // This configures webpack-dev-server which serves bundles from memory and provides live
  // reloading.
  devServer: {
    host: '0.0.0.0',
    port: process.env.PORT,
    historyApiFallback: true,
    hot: true,
    inline: true,
    publicPath: '/',
  },
});
