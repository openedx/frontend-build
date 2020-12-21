// Allow private/local overrides of env vars from .env.development(-stage) for config settings
// that you'd like to persist locally during development, without the risk of checking
// in temporary modifications to .env.development(-stage).

const fs = require('fs');
const dotenv = require('dotenv');

module.exports = (filePath) => {
  if (fs.existsSync(filePath)) {
    const privateEnvConfig = dotenv.parse(fs.readFileSync(filePath));
    Object.entries(privateEnvConfig).forEach(([key, value]) => {
      process.env[key] = value;
    });
  }
};
