const { commands } = require('./constants');

module.exports = (commandName) => {
  if (commands[commandName] === undefined) {
    throw new Error(`fedx-scripts: ${commandName} is unsupported in this version`);
  }

  const { configFile } = commands[commandName];
  const config = require(configFile);
  return config;
};
