const path = require('path');
const getProjectConfigFile = require('../lib/getProjectConfigFile');

module.exports = {
  "testURL": "http://localhost/",
  "setupFiles": [
    path.resolve(__dirname, 'jest/setupTest.js'),
  ],
  "rootDir": process.env.APP_DIR,
  "moduleNameMapper": {
    "\\.svg": path.resolve(__dirname, 'jest/svgrMock.js'),
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": path.resolve(__dirname, 'jest/fileMock.js'),
    "\\.(css|scss)$": "identity-obj-proxy",
  },
  "collectCoverageFrom": [
    "src/**/*.{js,jsx}",
  ],
  "coveragePathIgnorePatterns": [
    "/node_modules/",
    "setupTest.js",
  ],
  "transformIgnorePatterns": [
    "/node_modules/(?!@edx)",
  ],
  "transform": {
    "^.+\\.[t|j]sx?$": [
      "babel-jest",
      {
        configFile: getProjectConfigFile(process.env.APP_DIR, 'babel'),
      },
    ],
  },
}
