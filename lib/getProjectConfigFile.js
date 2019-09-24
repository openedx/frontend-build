const path = require('path');
const glob = require('glob');

const presets = require('./presets');
const { PROJECT_ROOT } = require('./paths');

module.exports = (commandName) => {
  const {
    globSearchPattern,
    suggestedName,
    configFile,
  } = presets[commandName];
  const globOptions = {
    cwd: PROJECT_ROOT,
    nodir: true,
    dot: true,
  };
  const filepaths = glob.sync(globSearchPattern, globOptions);

  if (filepaths.length === 0) {
    return configFile;
  }

  return path.resolve(PROJECT_ROOT, filepaths[0]);
};
