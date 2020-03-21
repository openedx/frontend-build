const path = require('path');
const resolveFilepaths = require('./resolveFilepaths');

const defaultConfigDir = path.resolve(__dirname, '../config');

function ConfigPreset({
  defaultDir = defaultConfigDir,
  defaultFilename,
  searchFilenames,
  searchFilepaths,
}) {
  return {
    defaultFilename,
    getDefault: () => require(require.resolve(`./${defaultFilename}`, { paths: [defaultDir] })),
    get defaultFilepath() {
      console.log('getting default filepath', defaultFilename, defaultDir);
      return require.resolve(`./${defaultFilename}`, { paths: [defaultDir] });
    },
    get resolvedFilepath() {
      return resolveFilepaths(
        searchFilenames.map(filename => `./${filename}`),
        [...searchFilepaths, defaultDir],
      );
    },
  };
}

module.exports = ConfigPreset;
