const { merge } = require('webpack-merge');
const getBaseConfig = require('./getBaseConfig');

module.exports = (commandName, configFragment = {}) => {
  const baseConfig = getBaseConfig(commandName);
  return merge(baseConfig, configFragment);
};
