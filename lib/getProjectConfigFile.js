const path = require('path');
const glob = require('glob');

const presets = require('./presets');
const { APP_ROOT } = require('./paths');

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

module.exports = (commandName) => {
  const {
    globSearchPattern,
    suggestedName,
    configFile,
  } = presets[commandName];
  const globOptions = {
    cwd: APP_ROOT,
    nodir: true,
    dot: true,
  };
  const filepaths = glob.sync(globSearchPattern, globOptions);

  if (filepaths.length === 0) {
    console.log(getNoProjectConfigMessage(commandName, suggestedName));
    return configFile;
  }

  return path.resolve(APP_ROOT, filepaths[0]);
};
