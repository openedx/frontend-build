const config = require('./babel.config');

config.presets.push('@babel/preset-typescript', '@babel/preset-flow');

module.exports = config;
