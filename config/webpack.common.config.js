const path = require('path');

const appDir = process.cwd();

module.exports = {
  entry: {
    app: path.resolve(appDir, 'src/index'),
  },
  output: {
    path: path.resolve(appDir, 'dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
