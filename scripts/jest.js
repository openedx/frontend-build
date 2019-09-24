const spawn = require('../lib/spawn');
const getProjectConfigFile = require('../lib/getProjectConfigFile.js');

module.exports = (args = []) => {
  getProjectConfigFile('jest');

  spawn('jest', args);
};
