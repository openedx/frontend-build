const path = require('path');

const { APP_ROOT } = require('../lib/paths');

module.exports = {
  entry: {
    app: path.resolve(APP_ROOT, 'src/index'),
  },
  output: {
    path: path.resolve(APP_ROOT, 'dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
