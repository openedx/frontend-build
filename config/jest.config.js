const path = require('path');
const fs = require('fs');

const presets = require('../lib/presets');

// This assigns the envConfigPath filepath based on whether env.config exists, otherwise it uses the fallback filepath.
// If both env.config.js and env.config.jsx files exist, then the former will be used to populate the Config Document.
let envConfigPath = path.resolve(__dirname, './jest/fallback.env.config.js');
const appEnvConfigPathJs = path.resolve(process.cwd(), './env.config.js');
const appEnvConfigPathJsx = path.resolve(process.cwd(), './env.config.jsx');

if (fs.existsSync(appEnvConfigPathJs)) {
  envConfigPath = appEnvConfigPathJs;
} else if (fs.existsSync(appEnvConfigPathJsx)) {
  envConfigPath = appEnvConfigPathJsx;
}

module.exports = {
  testURL: 'http://localhost/',
  setupFiles: [
    path.resolve(__dirname, 'jest/setupTest.js'),
  ],
  rootDir: process.cwd(),
  moduleNameMapper: {
    '\\.svg': path.resolve(__dirname, 'jest/svgrMock.js'),
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': path.resolve(__dirname, 'jest/fileMock.js'),
    '\\.(css|scss)$': 'identity-obj-proxy',
    'env.config': envConfigPath,
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'setupTest.js',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!@(open)?edx)',
  ],
  transform: {
    '^.+\\.[t|j]sx?$': [
      'babel-jest',
      {
        configFile: presets.babel.resolvedFilepath,
      },
    ],
  },
};
