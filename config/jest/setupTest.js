const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const testEnvFile = path.resolve(process.cwd(), '.env.test');

if (fs.existsSync(testEnvFile)) {
  dotenv.config({ path: testEnvFile });
}
