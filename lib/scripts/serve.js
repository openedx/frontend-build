const express = require('express');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const dotenv = require('dotenv');

const resolvePrivateEnvConfig = require('../resolvePrivateEnvConfig');

// Add process env vars. Currently used only for setting the
// server port and the publicPath
dotenv.config({
  path: path.resolve(process.cwd(), '.env.development'),
});

// Allow private/local overrides of env vars from .env.development for config settings
// that you'd like to persist locally during development, without the risk of checking
// in temporary modifications to .env.development.
resolvePrivateEnvConfig('.env.private');

function isDirectoryEmpty(directoryPath) {
  try {
    const files = fs.readdirSync(directoryPath);
    return files.length === 0;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Directory does not exist, so treat it as empty.
      return true;
    }
    throw error; // Throw the error for other cases
  }
}

const buildPath = path.join(process.cwd(), 'dist');
const buildPathIndex = path.join(buildPath, 'index.html');

const fallbackPort = 8080;

if (isDirectoryEmpty(buildPath)) {
  const formattedBuildCmd = chalk.bold.redBright('``npm run build``');
  console.log(chalk.bold.red(`ERROR: No build found. Please run ${formattedBuildCmd} first.`));
} else {
  let configuredPort;

  try {
    configuredPort = require(path.join(process.cwd(), 'env.config.js'))?.PORT;
  } catch (error) {
    // Pass. Consuming applications may not have an `env.config.js` file. This is OK.
  }

  if (!configuredPort) {
    configuredPort = process.env.PORT;
  }

  // No `PORT` found in `env.config.js` and/or `.env.development|private`, so output a warning.
  if (!configuredPort) {
    const formattedEnvDev = chalk.bold.yellowBright('.env.development');
    const formattedEnvConfig = chalk.bold.yellowBright('env.config.js');
    const formattedPort = chalk.bold.yellowBright(fallbackPort);
    console.log(chalk.yellow(`No port found in ${formattedEnvDev} and/or ${formattedEnvConfig} file(s). Falling back to port ${formattedPort}.\n`));
  }

  const app = express();

  // Fallback to standard example port if no PORT config is set.
  const PORT = configuredPort || fallbackPort;

  app.use(express.static(buildPath));

  app.use('*', (req, res) => {
    res.sendFile(buildPathIndex);
  });

  app.listen(PORT, () => {
    const formattedServedFile = chalk.bold.cyanBright(buildPathIndex);
    const formattedPort = chalk.bold.cyanBright(PORT);
    console.log(chalk.greenBright(`Serving ${formattedServedFile} on port ${formattedPort}...`));
  });
}
