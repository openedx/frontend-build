const { spawn } = require('child_process');
const defaultsDeep = require('lodash.defaultsdeep');

module.exports = (command, args, _options) => {
  const options = defaultsDeep({}, _options, {
    env: process.env,
    shell: true,
    stdio: 'inherit',
  });

  return spawn(command, args, options);
};
