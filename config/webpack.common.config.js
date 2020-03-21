const path = require('path');

module.exports = {
  entry: {
    app: path.resolve(process.cwd(), 'src/index'),
  },
  output: {
    path: path.resolve(process.cwd(), 'dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
