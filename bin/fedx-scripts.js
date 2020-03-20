#!/usr/bin/env node
const path = require('path');

process.env.PROJECT_ROOT = process.cwd();

// TODO make help work.

function resolveConfigFilepath(filepath) {
  return require.resolve(filepath, {
    paths: [
      process.cwd(),
      path.resolve(__dirname, '../config'),
    ],
  });
}

function prepareArgv(options) {
  // Remove the second item (fedx-scripts)
  process.argv.splice(1,1);

  // override or add options
  options.forEach(({keys, value }) => {
    // find index of any of the keys (key or its alias)
    const indexOfKey = keys.reduce((acc, currentKey) => {
      const indexOfKey = process.argv.indexOf(currentKey);
      return indexOfKey === -1 ? acc : indexOfKey;
    }, -1);

    if (indexOfKey === -1) {
      // It's not here, append it
      process.argv.push(keys[0]);
      process.argv.push(value);
    } else {
      // It's here, replace its value
      process.argv[indexOfKey + 1] = value;
    }
  });
  console.log(process.argv)
}

const getIndexOfOption = (optionKeys) => {
  for (let i = 0; i < optionKeys.length; i++) {
    if (process.argv.includes(optionKeys[i])) {
      return process.argv.indexOf(optionKeys[i]);
    }
  }
  return -1;
}

const ensureConfigOption = (defaultFilepath, keys = ['--config', '-c']) => {
  const indexOfOption = getIndexOfOption(keys);

  if (indexOfOption !== -1) {
    // explicily declare. no-op
    return;
  }

  const resolvedFilepath = require.resolve(defaultFilepath, { paths: [
    process.cwd(),
    path.resolve(__dirname, '../config'),
  ]});
  process.argv.push(keys[0]);
  process.argv.push(resolvedFilepath);
}

// command is the third argument after node and fedx-scripts
const command = process.argv[2];

process.argv.splice(1,1);

// ex
switch(command) {
  case 'babel':
    ensureConfigOption('./babel.config.js');
    require('@babel/cli/bin/babel');
  break;
  case 'webpack':
    ensureConfigOption('./webpack.prod.config.js');
    require('webpack/bin/webpack');
  break;
  case 'webpack-dev-server':
    ensureConfigOption('./webpack.dev.config.js');
    require('webpack-dev-server/bin/webpack-dev-server');
  break;
  case 'eslint':
    ensureConfigOption('./.eslintrc.js');
    require('eslint/bin/eslint');
  break;
  case 'jest':
    ensureConfigOption('./jest.config.js');
    require('jest/bin/jest');
  break;
  default:
    console.error(`${command} is not supported via fedx-scripts`)
    break;
}



// const { program } = require('commander');

// program
//   .command('<cmd>')
//   .allowUnknownOption()


// program
//   .command('babel', { noHelp: true })
//   .allowUnknownOption()
//   .option('-c, --config <file>', 'Configuration file', './babel.config.js')
//   .action((cmdObj) => {
//     const configFilePath = resolveConfigFilepath(cmdObj.config);
//     prepareArgv([
//       // config options is --config or -c per the babel docs
//       { keys: ['--config', '-c'], value: configFilePath }
//     ]);
//     require('@babel/cli/bin/babel');
//   });

// program
//   .command('eslint', { noHelp: true })
//   .allowUnknownOption()
//   .option('-c, --config <file>', 'Configuration file', './.eslintrc.js')
//   .action((cmdObj) => {
//     const configFilePath = resolveConfigFilepath(cmdObj.config);
//     prepareArgv([
//       // config options is --config or -c per the eslint docs
//       { keys: ['--config', '-c'], value: configFilePath }
//     ]);
//     require('eslint/bin/eslint');
//   });

// program
//   .command('jest', { noHelp: true })
//   .allowUnknownOption()
//   .option('-c, --config <file>', 'Configuration file', './jest.config.js')
//   .action((cmdObj) => {
//     const configFilePath = resolveConfigFilepath(cmdObj.config);
//     prepareArgv([
//       // config options is --config or -c per the babel docs
//       { keys: ['--config', '-c'], value: configFilePath }
//     ]);
//     require('jest/bin/jest');
//   });

// program
//   .command('webpack', { noHelp: true })
//   .allowUnknownOption()
//   .option('-c, --config <file>', 'Configuration file', './webpack.prod.config.js')
//   .action((cmdObj) => {
//     const configFilePath = resolveConfigFilepath(cmdObj.config);
//     prepareArgv([
//       // config option is only --config per the webpack docs
//       { keys: ['--config'], value: configFilePath }
//     ]);
//     require('webpack/bin/webpack');
//   });

// program
//   .command('webpack-dev-server')
//   .allowUnknownOption()
//   .addHelpCommand(false)
//   .option('-c, --config <file>', 'Configuration file', './webpack.dev.config.js')
//   .action((cmdObj) => {
//     const configFilePath = resolveConfigFilepath(cmdObj.config);
//     prepareArgv([
//       // config option is only --config per the webpack-dev-server docs
//       { keys: ['--config'], value: configFilePath }
//     ]);
//     require('webpack-dev-server/bin/webpack-dev-server');
//   });
// // must be before .parse()
// program.on('--help', () => {
//   console.log('');
//   console.log('Example call:');
//   console.log('  $ custom-help --help');
// });
// program.parse(process.argv);
