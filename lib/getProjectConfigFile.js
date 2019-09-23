const path = require('path');
const fs = require('fs');
const glob = require('glob');

const { commands } = require('./constants');

const getNoConfigFoundMessage = (commandName, suggestedName) => `
No project config found for ${commandName} (${suggestedName}) using
default config. If you would like to extend the default configuration,
Add a file named ${suggestedName} in the root of your project containing:

(${suggestedName})
-----------------------------------------------------------------------

const { getBaseConfig, createConfig } = require('@edx/frontend-build');

// Use createConfig to deep merge custom config
module.exports = createConfig('${commandName}', {
  ...options to merge
});

// Escape hatch: get the base config and take full control
// const baseConfig = getBaseConfig('${commandName}');
// module.exports = baseConfig;

-----------------------------------------------------------------------

`;


module.exports = (appDir, commandName) => {
  const {
    globSearchPattern,
    suggestedName,
    configFile,
   } = commands[commandName];
  const globOptions = {
    cwd: appDir,
    nodir: true,
    dot: true,
  };

  const filepaths = glob.sync(globSearchPattern, globOptions);

  if (filepaths.length === 0) {
    console.log(getNoConfigFoundMessage(commandName, suggestedName));
    return configFile;
  }

  return path.resolve(appDir, filepaths[0]);
}
