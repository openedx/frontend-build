const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const getProjectConfig = require('../lib/getProjectConfig.js');

module.exports = (appDir, args = []) => {
  const configIsSupplied = args.filter(arg => arg.includes('--config')).length > 0;

  if (!configIsSupplied) {
    const configFile = getProjectConfig(appDir, 'eslint');
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
