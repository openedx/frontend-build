const path = require('path');
const fs = require('fs');
const glob = require('glob');

const { commands } = require('./constants');

const getMissingFileMessage = (commandName, suggestedName) => `
fedx-scripts: no config file was found for ${commandName}. Add a file named ${suggestedName} in the root of your project that contains:

(${suggestedName})
------------------------------------------------------------

const { getConfig } = require('@edx/frontend-build-tools');
module.exports = getConfig('${commandName}');

------------------------------------------------------------

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
    // throw new Error(getMissingFileMessage(commandName, suggestedName));
    console.log(`No project config found for ${commandName} (${suggestedName}) using base config...`);
    return configFile;
  }

  return path.resolve(appDir, filepaths[0]);
}
