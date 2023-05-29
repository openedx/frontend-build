const path = require('path');
const fs = require('fs');

/**
 * Attempts to extract the Paragon version from the `node_modules` of
 * the consuming application.
 *
 * @param {string} dir Path to directory containing `node_modules`.
 * @returns {string} Paragon dependency version of the consuming application
 */
function getParagonVersion(dir) {
  const pathToPackageJson = `${dir}/node_modules/@edx/paragon/package.json`;
  if (!fs.existsSync(pathToPackageJson)) {
    return undefined;
  }
  return JSON.parse(fs.readFileSync(pathToPackageJson)).version;
}

/**
 * TODO
 */
function getParagonThemeCss(dir) {
  const pathToParagonThemeOutput = path.resolve(dir, './node_modules/@edx/paragon', 'dist', 'paragon-theme.json');
  if (!fs.existsSync(pathToParagonThemeOutput)) {
    return undefined;
  }
  const paragonConfig = JSON.parse(fs.readFileSync(pathToParagonThemeOutput));
  const {
    core: coreThemePath,
    variants: themeVariantPaths,
  } = paragonConfig?.themeUrls || {};

  const pathToCoreCss = path.resolve(dir, './node_modules/@edx/paragon', 'dist', coreThemePath.minified);
  const coreCssExists = fs.existsSync(pathToCoreCss);

  const validThemeVariantPaths = Object.entries(themeVariantPaths || {}).filter(([, value]) => {
    const themeVariantCssDefault = path.resolve(dir, './node_modules/@edx/paragon', 'dist', value.default);
    const themeVariantCssMinified = path.resolve(dir, './node_modules/@edx/paragon', 'dist', value.minified);
    return fs.existsSync(themeVariantCssDefault) && fs.existsSync(themeVariantCssMinified);
  });

  if (!coreCssExists || validThemeVariantPaths.length === 0) {
    return undefined;
  }
  const coreResult = {
    filePath: path.resolve(dir, pathToCoreCss),
    entryName: 'paragon.theme.core',
    outputChunkName: 'paragon-theme-core',
  };

  const themeVariantResults = {};
  validThemeVariantPaths.forEach(([key, value]) => {
    themeVariantResults[key] = {
      filePath: path.resolve(dir, './node_modules/@edx/paragon', 'dist', value.minified),
      entryName: `paragon.theme.variants.${key}`,
      outputChunkName: `paragon-theme-variant-${key}`,
    };
  });

  return {
    core: fs.existsSync(pathToCoreCss) ? coreResult : undefined,
    variants: themeVariantResults,
  };
}

function replacePeriodsWithHyphens(string) {
  return string.replaceAll('.', '-');
}

/**
 * TODO
 */
function getParagonCacheGroups(paragonThemeCss) {
  const cacheGroups = {};
  if (!paragonThemeCss) {
    return cacheGroups;
  }
  cacheGroups[paragonThemeCss.core.entryName] = {
    type: 'css/mini-extract',
    name: replacePeriodsWithHyphens(paragonThemeCss.core.entryName),
    chunks: chunk => chunk.name === paragonThemeCss.core.entryName,
    enforce: true,
  };
  Object.values(paragonThemeCss.variants).forEach(({ entryName }) => {
    cacheGroups[entryName] = {
      type: 'css/mini-extract',
      name: replacePeriodsWithHyphens(entryName),
      chunks: chunk => chunk.name === entryName,
      enforce: true,
    };
  });
  return cacheGroups;
}

function getParagonEntryPoints(paragonThemeCss) {
  const entryPoints = {};
  if (!paragonThemeCss) {
    return entryPoints;
  }
  entryPoints[paragonThemeCss.core.entryName] = path.resolve(process.cwd(), paragonThemeCss.core.filePath);
  Object.values(paragonThemeCss.variants).forEach(({ filePath, entryName }) => {
    entryPoints[entryName] = path.resolve(process.cwd(), filePath);
  });
  return entryPoints;
}

module.exports = {
  getParagonVersion,
  getParagonThemeCss,
  getParagonCacheGroups,
  getParagonEntryPoints,
  replacePeriodsWithHyphens,
};
