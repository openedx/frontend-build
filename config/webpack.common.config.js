const path = require('path');

const { PROJECT_ROOT } = require('../lib/paths');

module.exports = {
  entry: {
    app: path.resolve(PROJECT_ROOT, 'src/index'),
  },
  output: {
    path: path.resolve(PROJECT_ROOT, 'dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
