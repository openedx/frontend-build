const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const getProjectConfigFile = require('../lib/getProjectConfigFile.js');

module.exports = (args = []) => {
  getProjectConfigFile('jest');

  spawn('jest', [
    ...args,
  ], {
    shell: true,
    stdio: 'inherit',
  });
};
