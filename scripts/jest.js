const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const getProjectConfig = require('../lib/getProjectConfig.js');

module.exports = (appDir, args = []) => {
  getProjectConfig(appDir, 'jest');

  spawn('jest', [
    ...args,
  ], {
    appDir,
    shell: true,
    stdio: 'inherit',
  });
};
