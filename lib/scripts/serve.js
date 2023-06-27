const express = require('express');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

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
  let envConfig;
  try {
    envConfig = require(path.join(process.cwd(), 'env.config.js'));
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      const formattedEnvConfig = chalk.bold.yellowBright('env.config.js');
      const formattedPort = chalk.bold.yellowBright(fallbackPort);
      console.log(chalk.yellow(`No ${formattedEnvConfig} file found. Falling back to port ${formattedPort}. \n`));
    } else {
      throw error;
    }
  }

  const app = express();

  // Fallback to standard example port if no PORT config is set.
  const PORT = envConfig?.PORT || fallbackPort;

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
