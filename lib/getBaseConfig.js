const presets = require('./presets');

module.exports = (commandName) => {
  if (presets[commandName] === undefined) {
    throw new Error(`fedx-scripts: ${commandName} is unsupported in this version`);
  }

  const { configFile } = presets[commandName];
  const config = require(configFile);
  return config;
};
