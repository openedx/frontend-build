const getProjectConfigFile = require('../lib/getProjectConfigFile.js');
const spawn = require('../lib/spawn');
const { PROJECT_ROOT } = require('../lib/paths');

module.exports = (args = []) => {
  const configIsSupplied = args.filter(arg => arg.includes('--config')).length > 0;

  if (!configIsSupplied) {
    const configFile = getProjectConfigFile('eslint');
    args.push(`--config=${configFile}`);
  }

  spawn('eslint', [...args, PROJECT_ROOT]).on('exit', (code) => {
    process.exit(code);
  });
};
