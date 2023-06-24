const presets = require('./presets');
const mfePath = require('./mfePath');

module.exports = (commandName) => {
  if (presets[commandName] === undefined) {
    throw new Error(`fedx-scripts: ${commandName} is unsupported in this version`);
  }

  if (commandName === 'webpack-prod') {
    mfePath.path = presets[commandName].getMfePath();
  }

  return presets[commandName].getDefault();
};
