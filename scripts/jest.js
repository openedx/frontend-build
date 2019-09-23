const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const getProjectConfigFile = require('../lib/getProjectConfigFile.js');

module.exports = (appDir, args = []) => {
  getProjectConfigFile(appDir, 'jest');

  spawn('jest', [
    ...args,
  ], {
    appDir,
    shell: true,
    stdio: 'inherit',
  });
};
