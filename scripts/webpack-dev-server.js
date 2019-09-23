const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const getProjectConfigFile = require('../lib/getProjectConfigFile.js');

module.exports = (appDir, args = []) => {
  const configIsSupplied = args.filter(arg => arg.includes('--config')).length > 0;

  if (!configIsSupplied) {
    const configFile = getProjectConfigFile(appDir, 'webpack-dev');
    args.push(`--config=${configFile}`)
  }

  spawn('webpack-dev-server', args, {
    env: Object.assign({}, process.env, {
      NODE_ENV: 'development',
      BABEL_ENV: 'development',
    }),
    shell: true,
    stdio: 'inherit',
  });
};
