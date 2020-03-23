const path = require('path');

const presets = require('../lib/presets');

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
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'setupTest.js',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!@edx)',
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
