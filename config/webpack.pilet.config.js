/**
 * This webpack config is derived from the OpenEdx prod webpack config and is
 * used to bundle the Open Edx pilets. It removes the ReactRefreshWebpackPlugin
 * as it was conflicting with Piral during bundling. It als remoes the HTMLWebpack
 * plugin as Pilets, unlike MFE's, are not independently run.
 */

// This is the prod Webpack config. All settings here should prefer smaller,
// optimized bundles at the expense of a longer build time.
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');
const Dotenv = require('dotenv-webpack');
const dotenv = require('dotenv');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PostCssAutoprefixerPlugin = require('autoprefixer');
const PostCssRTLCSS = require('postcss-rtlcss');
const PostCssCustomMediaCSS = require('postcss-custom-media');
const path = require('path');
const getLocalAliases = require('./getLocalAliases');

const commonConfig = require('./webpack.common.config');

const presets = require('../lib/presets');

delete commonConfig.entry;
delete commonConfig.output;

// Add process env vars. Currently used only for setting the PUBLIC_PATH.
dotenv.config({
  path: path.resolve(process.cwd(), '.env.development'),
});

const aliases = getLocalAliases();

const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';

module.exports = merge(commonConfig, {
  // eslint-disable-next-line object-shorthand
  mode: mode,
  devtool: 'eval-source-map',
  resolve: {
    alias: aliases,
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    // Specify file-by-file rules to Webpack. Some file-types need a particular kind of loader.
    rules: [
      // The babel-loader transforms newer ES2015+ syntax to older ES5 for older browsers.
      // Babel is configured with the .babelrc file at the root of the project.
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!@edx)/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: presets['babel-typescript'].resolvedFilepath,
          },
        },
      },
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
        minimizer: {
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
        },
      }),
    ],
  },
  // Specify additional processing or side-effects done on the Webpack output bundles as a whole.
  plugins: [
    // Cleans the dist directory before each build
    new CleanWebpackPlugin(),
    // Writes the extracted CSS from each entry to a file in the output directory.
    new MiniCssExtractPlugin({
      filename: '[name].[chunkhash].css',
    }),
    new Dotenv({
      path: path.resolve(process.cwd(), '.env.development'),
      systemvars: true,
    }),
  ],
});
