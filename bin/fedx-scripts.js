#!/usr/bin/env node

const args = process.argv.slice(2);
const command = args.shift();

process.env.APP_DIR = process.cwd(); // TODO: used in jest config, needed?

switch (command) {
  case 'babel':
  case 'eslint':
  case 'jest':
  case 'webpack':
  case 'webpack-dev-server':
    require(`../scripts/${command}.js`)(process.cwd(), args);
    break;
  default:
    console.log(`fedx-scripts: The command ${command} is unsupported`);
}
