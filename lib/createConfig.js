const { merge } = require('webpack-merge');
const path = require('path');
const getBaseConfig = require('./getBaseConfig');
const mfePath = require('./mfePath');

module.exports = (commandName, configFragment = {}) => {
  const baseConfig = getBaseConfig(commandName);

  if (commandName === 'webpack-prod') {
    const { path: cachePath } = mfePath;
    baseConfig.cache = {
      type: 'filesystem',
      cacheDirectory: path.resolve(cachePath, '.cache'),
    };

    const ignorePlugins = ['NewRelicPlugin', 'HtmlWebpackNewRelicPlugin', 'BundleAnalyzerPlugin'];

    const { plugins } = baseConfig;

    baseConfig.plugins = plugins.filter((plugin) => !ignorePlugins.includes(plugin.constructor.name));

    baseConfig.devtool = false;

    return merge(baseConfig, configFragment);
  }

  return merge(baseConfig, configFragment);
};
