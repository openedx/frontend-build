const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
require('babel-polyfill');

const testEnvFile = path.resolve(process.cwd(), '.env.test');

if (fs.existsSync(testEnvFile)) {
  dotenv.config({ path: testEnvFile });
}
