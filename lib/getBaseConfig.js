const { commands } = require('./constants');

module.exports = (commandName, mergeFn) => {
  if (commands[commandName] === undefined) {
    throw new Error(`fedx-scripts: ${commandName} is unsupported in this version`);
  }

  const { configFile } = commands[commandName];
  const config = require(configFile);

  if (mergeFn) {
    return mergeFn(config);
  }

  return config;
}
