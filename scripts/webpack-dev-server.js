const path = require('path');
const fs = require('fs');
const spawn = require('../lib/spawn');
const getProjectConfigFile = require('../lib/getProjectConfigFile.js');

module.exports = (appDir, args = []) => {
  const configIsSupplied = args.filter(arg => arg.includes('--config')).length > 0;

  if (!configIsSupplied) {
    const configFile = getProjectConfigFile('webpack-dev');
    args.push(`--config=${configFile}`)
  }

  spawn('webpack-dev-server', args, {
    env: {
      NODE_ENV: 'development',
      BABEL_ENV: 'development',
    },
  });
};
