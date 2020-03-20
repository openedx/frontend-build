const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const config = {
  // Configuration Object
  mode: 'production',
  // entry: './src',
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules\/(?!@edx)/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre',
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin(),
    new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }),
  ]
};

module.exports = config;
