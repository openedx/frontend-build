const path = require('path');

module.exports = {
  entry: {
    app: path.resolve(process.cwd(), './src/index'),
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
      'env.config': path.resolve(__dirname, `./env.config.js`),
    },
    extensions: ['.js', '.jsx'],
  },
};
