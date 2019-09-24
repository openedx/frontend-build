const { spawn } = require('child_process');
const path = require('path');
const defaultsDeep = require('lodash.defaultsdeep');

module.exports = (command, args, _options) => {
  // // Add the local node_modules bin directory to the path so
  // // that we can be sure to execute external commands even when
  // // developing locally through npm link for symlink installs
  // const LOCAL_BIN_PATH = path.resolve(__dirname, '../node_modules/.bin');
  // const env = Object.assign({}, process.env, {
  //   PATH: `${LOCAL_BIN_PATH}:${process.env.PATH}`,
  // })

  const options = defaultsDeep(
    {},
    _options,
    {
      env: process.env,
      shell: true,
      stdio: 'inherit',
    },
  );

  return spawn(command, args, options);
};