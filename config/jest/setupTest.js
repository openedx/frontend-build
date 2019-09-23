const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
require('babel-polyfill');

const { APP_ROOT } = require('../../lib/paths');

const testEnvFile = path.resolve(APP_ROOT, '.env.development');

if (fs.existsSync(testEnvFile)) {
  dotenv.config({ path: testEnvFile });
}

