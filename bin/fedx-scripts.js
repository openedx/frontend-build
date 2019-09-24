#!/usr/bin/env node

process.env.APP_ROOT = process.cwd();

// args come in the format: node fedx-scripts <command> <options>
const args = process.argv.slice(2);
const command = args.shift();

switch (command) {
  case 'babel':
  case 'eslint':
  case 'jest':
  case 'webpack':
  case 'webpack-dev-server':
    require(`../scripts/${command}.js`)(args);
    break;
  default:
    console.log(`fedx-scripts: The command ${command} is unsupported`);
}
