// This is the prod Webpack config. All settings here should prefer smaller,
// optimized bundles at the expense of a longer build time.

const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');
const CssNano = require('cssnano');
const Dotenv = require('dotenv-webpack');
const dotenv = require('dotenv');
const NewRelicSourceMapPlugin = require('@edx/new-relic-source-map-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const PostCssAutoprefixerPlugin = require('autoprefixer');
const PostCssRTLCSS = require('postcss-rtlcss');
const PostCssCustomMediaCSS = require('postcss-custom-media');

// Reduce CSS file size by ~70%
const purgecss = require('@fullhuman/postcss-purgecss');

const HtmlWebpackNewRelicPlugin = require('../lib/plugins/html-webpack-new-relic-plugin');
const commonConfig = require('./webpack.common.config');
const presets = require('../lib/presets');

// Add process env vars. Currently used only for setting the PUBLIC_PATH.
dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

const extraPostCssPlugins = [];
if (process.env.USE_PURGECSS) { // If USE_PURGECSS is set we append it.
  extraPostCssPlugins.push(purgecss({
    content: ['./**/*.html', './**/*.js', './**/*.jsx', './**/*.ts', './**/*.tsx'],
  }));
}
const extraPlugins = [];
if (process.env.ENABLE_NEW_RELIC !== 'false') {
  // Enable NewRelic logging only if the account ID is properly defined
  extraPlugins.push(new HtmlWebpackNewRelicPlugin({
    // This plugin fixes an issue where the newrelic script will break if
    // not added directly to the HTML.
    // We use non empty strings as defaults here to prevent errors for empty configs
    accountID: process.env.NEW_RELIC_ACCOUNT_ID || 'undefined_account_id',
    agentID: process.env.NEW_RELIC_AGENT_ID || 'undefined_agent_id',
    trustKey: process.env.NEW_RELIC_TRUST_KEY || 'undefined_trust_key',
    licenseKey: process.env.NEW_RELIC_LICENSE_KEY || 'undefined_license_key',
    applicationID: process.env.NEW_RELIC_APP_ID || 'undefined_application_id',
  }));
  extraPlugins.push(new NewRelicSourceMapPlugin({
    applicationId: process.env.NEW_RELIC_APP_ID,
    apiKey: process.env.NEW_RELIC_ADMIN_KEY,
    staticAssetUrl: process.env.BASE_URL,
    // upload source maps in prod builds only
    noop: typeof process.env.NEW_RELIC_ADMIN_KEY === 'undefined',
  }));
}

module.exports = merge(commonConfig, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(process.cwd(), 'dist'),
    publicPath: process.env.PUBLIC_PATH || '/',
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
          },
        },
      },
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre',
      },
      // Webpack, by default, includes all CSS in the javascript bundles. Unfortunately, that means:
      // a) The CSS won't be cached by browsers separately (a javascript change will force CSS
      // re-download).  b) Since CSS is applied asyncronously, it causes an ugly
      // flash-of-unstyled-content.
      //
      // To avoid these problems, we extract the CSS from the bundles into separate CSS files that
      // can be included as <link> tags in the HTML <head> manually.
      //
      // We will not do this in development because it prevents hot-reloading from working and it
      // increases build time.
      {
        test: /(.scss|.css)$/,
        use: [
          MiniCssExtractPlugin.loader,
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
                  CssNano(),
                  ...extraPostCssPlugins,
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
  // New in Webpack 4. Replaces CommonChunksPlugin. Extract common modules among all chunks to one
  // common chunk and extract the Webpack runtime to a single runtime chunk.
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
    },
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
      path: path.resolve(process.cwd(), '.env'),
      systemvars: true,
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
    }),
    ...extraPlugins,
  ],
});
