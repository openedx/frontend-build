// This is the dev Webpack config. All settings here should prefer a fast build
// time at the expense of creating larger, unoptimized bundles.

const { merge } = require('webpack-merge');
const Dotenv = require('dotenv-webpack');
const dotenv = require('dotenv');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const PostCssAutoprefixerPlugin = require('autoprefixer');
const PostCssRTLCSS = require('postcss-rtlcss');
const { HotModuleReplacementPlugin } = require('webpack');

const commonConfig = require('./webpack.common.config.js');
const presets = require('../lib/presets');
const resolvePrivateEnvConfig = require('../lib/resolvePrivateEnvConfig');

// Add process env vars. Currently used only for setting the
// server port and the publicPath
dotenv.config({
  path: path.resolve(process.cwd(), '.env.development'),
});

// Allow private/local overrides of env vars from .env.development for config settings
// that you'd like to persist locally during development, without the risk of checking
// in temporary modifications to .env.development.
resolvePrivateEnvConfig('.env.private');

/*
This function reads in a 'module.config.js' file if it exists and uses its contents to define
a set of webpack resolve.alias aliases for doing local development of application dependencies.
It reads the package.json file of the dependency to determine if it has any peer dependencies, and
then forces those peer dependencies to be resolved with the application's version.  Primarily, this
is useful for making sure there's only one version of those dependencies loaded at once, which is a
problem with both react and react-intl.

The module.config.js file should have the form:

{
  localModules: [
    { moduleName: 'nameOfPackage', dir: '../path/to/repo', dist: '/path/to/dist/in/repo' },
    ... others...
  ],
}

Some working examples, as of the time of this writing:

{ moduleName: '@edx/paragon/scss', dir: '../paragon', dist: 'scss' }
{ moduleName: '@edx/paragon', dir: '../paragon', dist: 'dist' }
{ moduleName: '@edx/frontend-platform', dir: '../frontend-platform', dist: 'dist' }

*/
function getLocalAliases() {
  const aliases = {};

  try {
    const moduleConfigPath = path.resolve(process.cwd(), 'module.config.js');
    if (!fs.existsSync(moduleConfigPath)) {
      console.log('No local module configuration file found. This is fine.');
      return aliases;
    }
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const { localModules } = require(moduleConfigPath);

    let allPeerDependencies = [];
    const excludedPeerPackages = [];
    if (localModules.length > 0) {
      console.info('Resolving modules from local directories via module.config.js.');
    }
    localModules.forEach(({ moduleName, dir, dist = '' }) => {
      console.info(`Using local version of ${moduleName} from ${dir}/${dist}.`);
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const { peerDependencies = {}, name } = require(path.resolve(process.cwd(), dir, 'package.json'));
      allPeerDependencies = allPeerDependencies.concat(Object.keys(peerDependencies));
      aliases[moduleName] = path.resolve(process.cwd(), dir, dist);
      excludedPeerPackages.push(name);
    });

    allPeerDependencies = allPeerDependencies.filter((dep) => !excludedPeerPackages.includes(dep));

    allPeerDependencies.forEach((dep) => {
      aliases[dep] = path.resolve(process.cwd(), 'node_modules', dep);
    });
  } catch (e) {
    console.error(e);
    console.error('Error in module.config.js parsing. module.config.js will be ignored.');
    return {};
  }
  return aliases;
}

const aliases = getLocalAliases();
const PUBLIC_PATH = process.env.PUBLIC_PATH || '/';

module.exports = merge(commonConfig, {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: {
    // enable react's custom hot dev client so we get errors reported in the browser
    hot: require.resolve('react-dev-utils/webpackHotDevClient'),
    app: path.resolve(process.cwd(), 'src/index'),
  },
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
        exclude: /node_modules\/(?!@edx)/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: presets.babel.resolvedFilepath,
            // Caches result of loader to the filesystem. Future builds will attempt to read
            // from the cache to avoid needing to run the expensive recompilation process
            // on each run.
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
              postcssOptions: {
                plugins: [
                  PostCssAutoprefixerPlugin({ grid: true }),
                  PostCssRTLCSS(),
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
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65,
              },
              gifsicle: {
                interlaced: false,
              },
              pngquant: {
                quality: [0.65, 0.90],
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
      template: path.resolve(process.cwd(), 'public/index.html'),
      FAVICON_URL: process.env.FAVICON_URL || null,
    }),
    new Dotenv({
      path: path.resolve(process.cwd(), '.env.development'),
      systemvars: true,
    }),
    // when the --hot option is not passed in as part of the command
    // the HotModuleReplacementPlugin has to be specified in the Webpack configuration
    // https://webpack.js.org/configuration/dev-server/#devserver-hot
    new HotModuleReplacementPlugin(),
  ],
  // This configures webpack-dev-server which serves bundles from memory and provides live
  // reloading.
  devServer: {
    host: '0.0.0.0',
    port: process.env.PORT || 8080,
    historyApiFallback: {
      index: path.join(PUBLIC_PATH, 'index.html'),
    },
    // Enable hot reloading server. It will provide WDS_SOCKET_PATH endpoint
    // for the WebpackDevServer client so it can learn when the files were
    // updated. The WebpackDevServer client is included as an entry point
    // in the webpack development configuration. Note that only changes
    // to CSS are currently hot reloaded. JS changes will refresh the browser.
    hot: true,
    // Use 'ws' instead of 'sockjs-node' on server since we're using native
    // websockets in `webpackHotDevClient`.
    transportMode: 'ws',
    devMiddleware: {
      publicPath: PUBLIC_PATH,
    },
  },
});
