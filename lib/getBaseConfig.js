const presets = require('./presets');

module.exports = (commandName) => {
  if (presets[commandName] === undefined) {
    throw new Error(`fedx-scripts: ${commandName} is unsupported in this version`);
  }

  return presets[commandName].getDefault();
};
