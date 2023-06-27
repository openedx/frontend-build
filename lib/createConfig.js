const { merge } = require('webpack-merge');
const path = require('path');
const getBaseConfig = require('./getBaseConfig');
const presets = require('./presets');

module.exports = (commandName, configFragment = {}) => {
  const baseConfig = getBaseConfig(commandName);

  if (commandName === 'webpack-prod' && process.env.ENABLE_WEBPACK_CACHE !== 'false') {
    const cacheFolderPath = presets[commandName].getMfePath();
    baseConfig.cache = {
      type: 'filesystem',
      cacheDirectory: path.resolve(cacheFolderPath, '.cache'),
    };

    return merge(baseConfig, configFragment);
  }

  return merge(baseConfig, configFragment);
};
