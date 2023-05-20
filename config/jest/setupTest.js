const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
require('babel-polyfill');

const testEnvFile = path.resolve(process.cwd(), '.env.test');

if (fs.existsSync(testEnvFile)) {
  dotenv.config({ path: testEnvFile });
}

global.PARAGON = {
  version: '1.0.0',
  themeUrls: {
    core: 'core.min.css',
    variants: {
      light: 'light.min.css',
    },
  },
};
