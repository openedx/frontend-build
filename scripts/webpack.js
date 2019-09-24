const getProjectConfigFile = require('../lib/getProjectConfigFile.js');
const spawn = require('../lib/spawn');

module.exports = (args = []) => {
  const configIsSupplied = args.filter(arg => arg.includes('--config')).length > 0;

  if (!configIsSupplied) {
    const configFile = getProjectConfigFile('webpack-prod');
    args.push(`--config=${configFile}`);
  }

  spawn('webpack', args, {
    env: {
      NODE_ENV: 'production',
      BABEL_ENV: 'production',
    },
  });
};
