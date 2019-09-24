const path = require('path');
const fs = require('fs');
const getProjectConfigFile = require('../lib/getProjectConfigFile.js');
const spawn = require('../lib/spawn');

module.exports = (args = []) => {
  const configIsSupplied = args.filter(arg => arg.includes('--config-file')).length > 0;

  if (!configIsSupplied) {
    const configFile = getProjectConfigFile('babel');
    args.push(`--config-file=${configFile}`)
  }

  spawn('babel', args);
};
