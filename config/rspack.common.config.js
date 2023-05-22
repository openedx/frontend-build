module.exports = {
  entry: {
    main: './src/index.js',
  },
  output: {
    path: './dist',
    publicPath: '/',
  },
  resolve: {
    alias: {
      'env.config': './env.config',
    },
    fallback: {
      // This causes the system to return an empty object if it can't find an env.config.js file in
      // the application being built.
      'env.config': false,
    },
    extensions: ['.js', '.jsx'],
  },
};
