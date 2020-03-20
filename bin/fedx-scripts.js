#!/usr/bin/env node
const path = require('path');

/**
 * This file executes forwards cli commands by manipulating process.argv values
 * and then directly requiring bin scripts from the specified packages.
 */


// Ensures that a config option already exists and if it does not adds a default
function ensureConfigOption(defaultFilepath, keys = ['--config', '-c']) {
  const optionExists = process.argv.some(arg => keys.includes(arg));

  // explicily declared. no-op
  if (optionExists) {
    return;
  }

  const resolvedFilepath = require.resolve(defaultFilepath, {
    paths: [
      process.cwd(),
      path.resolve(__dirname, '../config'),
    ],
  });

  process.argv.push(keys[0]);
  process.argv.push(resolvedFilepath);
}

// command is the third argument after node and fedx-scripts
const commandName = process.argv[2];

// remove fedx-scripts from process.argv to allow subcommands to read options properly
process.argv.splice(1, 1);

switch (commandName) {
  case 'babel':
    ensureConfigOption('./babel.config.js');
    require('@babel/cli/bin/babel');
    break;
  case 'eslint':
    ensureConfigOption('./.eslintrc.js');
    require('eslint/bin/eslint');
    break;
  case 'jest':
    ensureConfigOption('./jest.config.js');
    require('jest/bin/jest');
    break;
  case 'webpack':
    ensureConfigOption('./webpack.prod.config.js');
    require('webpack/bin/webpack');
    break;
  case 'webpack-dev-server':
    ensureConfigOption('./webpack.dev.config.js');
    require('webpack-dev-server/bin/webpack-dev-server');
    break;
  default:
    console.error(`${commandName} is not supported via fedx-scripts`);
}
