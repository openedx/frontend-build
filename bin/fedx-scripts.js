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
    // The include option is used to specify which additional source folders to extract messages from.
    // To extract more messages on other source folders use: --include=plugins --include=plugins2
    // The intention use case is to allow extraction from the 'plugins' directory on 'frontend-app-authoring'.
    // That plugins folder were kept outside the src folder to ensure they remain independent and
    // can function without relying on the MFE environment's special features.
    // This approach allows them to be packaged separately as NPM packages.
    const additionalSrcFolders = [];
    process.argv.forEach((val, index) => {
      // if val starts with --include= then add the value to additionalSrcFolders
      if (val.startsWith('--include=')) {
        additionalSrcFolders.push(val.split('=')[1]);
        // remove the value from process.argv
        process.argv.splice(index, 1);
      }
    });
    const srcFolders = ['src'].concat(additionalSrcFolders);
    let srcFoldersString = srcFolders.join(',');
    if (srcFolders.length > 1) {
      srcFoldersString = `{${srcFoldersString}}`;
    }
    const commonArgs = [
      '--format', 'node_modules/@openedx/frontend-build/lib/formatter.js',
      '--ignore', `${srcFoldersString}/**/*.json`,
      '--ignore', `${srcFoldersString}/**/*.d.ts`,
      '--out-file', './temp/babel-plugin-formatjs/Default.messages.json',
      '--', `${srcFoldersString}/**/*.{j,t}s*`,
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
