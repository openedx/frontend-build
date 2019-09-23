const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const getProjectConfig = require('../lib/getProjectConfig.js');

module.exports = (appDir, args = []) => {
  const configIsSupplied = args.filter(arg => arg.includes('--config')).length > 0;

  if (!configIsSupplied) {
    const configFile = getProjectConfig(appDir, 'webpack-prod');
    args.push(`--config=${configFile}`)
  }

  spawn('webpack', args, {
    env: Object.assign({}, process.env, {
      NODE_ENV: 'production',
      BABEL_ENV: 'production',
    }),
    shell: true,
    stdio: 'inherit',
  });
};
