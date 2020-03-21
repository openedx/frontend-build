#!/usr/bin/env node
const presets = require('../lib/presets');

/**
 * This file executes forwards cli commands by manipulating process.argv values
 * and then directly requiring bin scripts from the specified packages
 * (as opposed to attempting to run them from the aliases npm copies to the .bin
 * folder upon install). This seems like a relatively safe thing to do since
 * these file names are identical to their cli name and this method of
 * requiring/executing them should behave the same as if run from the command
 * line as usual.
 */


// Ensures that a config option already exists and if it does not adds a default
function configOptionExists(keys = ['--config', '-c']) {
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

function ensureConfigOption(preset) {
  if (!configOptionExists()) {
    console.log(`Running with resolved config:\n${preset.resolvedFilepath}\n`);
    process.argv.push('--config');
    process.argv.push(preset.resolvedFilepath);
  }
}

// commandName is the third argument after node and fedx-scripts
const commandName = process.argv[2];

// remove fedx-scripts from process.argv to allow subcommands to read options properly
process.argv.splice(1, 1);

switch (commandName) {
  case 'babel':
    ensureConfigOption(presets.babel);
    require('@babel/cli/bin/babel');
    break;
  case 'eslint':
    ensureConfigOption(presets.eslint);
    require('eslint/bin/eslint');
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
  default:
}
