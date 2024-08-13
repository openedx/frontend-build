const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
require('babel-polyfill');

const testEnvFile = path.resolve(process.cwd(), '.env.test');

if (fs.existsSync(testEnvFile)) {
  dotenv.config({ path: testEnvFile });
}

global.PARAGON_THEME = {
  paragon: {
    version: '1.0.0',
    themeUrls: {
      core: {
        fileName: 'core.min.css',
      },
      defaults: {
        light: 'light',
      },
      variants: {
        light: {
          fileName: 'light.min.css',
        },
      },
    },
  },
  brand: {
    version: '1.0.0',
    themeUrls: {
      core: {
        fileName: 'core.min.css',
      },
      defaults: {
        light: 'light',
      },
      variants: {
        light: {
          fileName: 'light.min.css',
        },
      },
    },
  },
};
