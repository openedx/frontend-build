const path = require('path');
const fs = require('fs');
const glob = require('glob');

const { commands } = require('./constants');

const getNoProjectConfigMessage = (commandName, suggestedName) => `
No project config found for ${commandName} (${suggestedName}) 
using base config... For custom configuration, add  a file 
named ${suggestedName} in the project root containing:


Method 1: Extend base config (${suggestedName})
---------------------------------------------------------------

const { createConfig } = require('@edx/frontend-build');
module.exports = createConfig('${commandName}', {
  /* option overrides or extensions */
});

---------------------------------------------------------------


Method 2: Custom manipulations (${suggestedName})
---------------------------------------------------------------

const { getBaseConfig } = require('@edx/frontend-build');
const config = getBaseConfig('${commandName}');

/* Custom config manipulations */

module.exports = config;

---------------------------------------------------------------

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
    // throw new Error();
    console.log(getNoProjectConfigMessage(commandName, suggestedName));
    return configFile;
  }

  return path.resolve(appDir, filepaths[0]);
}
