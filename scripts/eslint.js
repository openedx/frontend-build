const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const getProjectConfigFile = require('../lib/getProjectConfigFile.js');

module.exports = (appDir, args = []) => {
  const configIsSupplied = args.filter(arg => arg.includes('--config')).length > 0;

  if (!configIsSupplied) {
    const configFile = getProjectConfigFile(appDir, 'eslint');
    args.push(`--config=${configFile}`)
  }

  spawn('eslint', [
    ...args,
    appDir
  ], {
    appDir,
    shell: true,
    stdio: 'inherit',
  });
};
