const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const getProjectConfigFile = require('../lib/getProjectConfigFile.js');

module.exports = (appDir, args = []) => {
  const configIsSupplied = args.filter(arg => arg.includes('--config-file')).length > 0;

  if (!configIsSupplied) {
    const configFile = getProjectConfigFile(appDir, 'babel');
    args.push(`--config-file=${configFile}`)
  }

  spawn('babel', args, {
    shell: true,
    stdio: 'inherit',
  });
};
