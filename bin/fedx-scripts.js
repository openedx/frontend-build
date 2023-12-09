#!/usr/bin/env node

const chalk = require('chalk');

const presets = require('../lib/presets');

/**
 * TLDR:
 *  - Find the command to be run in process.argv
 *  - Remove fedx-scripts in process.argv
 *  - Add a --config option to process.argv if one is missing
 *  - Execute the command's bin script by pulling it directly in with require()
 *
 * This file forwards cli commands by manipulating process.argv values and then
 * directly requiring bin scripts from the specified packages (as opposed to
 * attempting to run them from the aliases npm copies to the .bin folder upon
 * install). This seems like a relatively safe thing to do since these file
 * names are identical to their cli name and this method of requiring/executing
 * them should behave the same as if run from the command line as usual.
 */

function optionExists(keys) {
  return process.argv.some((arg) => {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < keys.length; i++) {
      if (arg.startsWith(keys[i])) {
        return true;
      }
    }
    return false;
  });
}

// Ensures that a config option already exists and if it does not adds a default
function ensureConfigOption(preset, keys = ['--config', '-c']) {
  if (!optionExists(keys)) {
    console.log(`Running with resolved config:\n${preset.resolvedFilepath}\n`);
    process.argv.push(keys[0]);
    process.argv.push(preset.resolvedFilepath);
  }
}

// commandName is the third argument after node and fedx-scripts
const commandName = process.argv[2];

// remove fedx-scripts from process.argv to allow subcommands to read options properly
process.argv.splice(1, 1);

switch (commandName) {
  case 'babel':
    ensureConfigOption(presets.babel, ['--config-file']);
    require('@babel/cli/bin/babel');
    break;
  case 'eslint':
    ensureConfigOption(presets.eslint);
    // eslint-disable-next-line import/extensions, import/no-extraneous-dependencies
    require('.bin/eslint');
    break;
  case 'jest':
    ensureConfigOption(presets.jest);
    require('jest/bin/jest');
    break;
  case 'webpack':
    ensureConfigOption(presets.webpack);
    require('webpack/bin/webpack');
    break;
  case 'webpack-dev-server':
    ensureConfigOption(presets.webpackDevServer);
    require('webpack-dev-server/bin/webpack-dev-server');
    break;
  case 'formatjs': {
    const commonArgs = [
      '--format', 'node_modules/@edx/frontend-build/lib/formatter.js',
      '--ignore', 'src/**/*.json',
      '--out-file', './temp/babel-plugin-formatjs/Default.messages.json',
      '--', 'src/**/*.js*',
    ];
    process.argv = process.argv.concat(commonArgs);
    ensureConfigOption(presets.formatjs);
    require('@formatjs/cli/bin/formatjs');
    break;
  }
  case 'serve':
    require('../lib/scripts/serve');
    break;
  default:
    console.log(chalk.red(`[ERROR] fedx-scripts: The command ${chalk.bold.red(commandName)} is unsupported.`));
}
