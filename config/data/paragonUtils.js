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
 * @typedef {Object} ParagonThemeCssAsset
 * @property {string} filePath
 * @property {string} entryName
 * @property {string} outputChunkName
 */

/**
 * @typedef {Object} ParagonThemeVariantCssAsset
 * @property {string} filePath
 * @property {string} entryName
 * @property {string} outputChunkName
 * @property {boolean} default
 * @property {boolean} dark
 */

/**
 * @typedef {Object} ParagonThemeCss
 * @property {ParagonThemeCssAsset} core The metadata about the core Paragon theme CSS
 * @property {Object.<string, ParagonThemeVariantCssAsset>} variants A collection of theme variants.
 */

/**
 * Attempts to extract the Paragon theme CSS from the locally installed `@edx/paragon` package.
 * @param {string} dir Path to directory containing `node_modules`.
 * @returns {ParagonThemeCss}
 */
function getParagonThemeCss(dir) {
  const pathToParagonThemeOutput = path.resolve(dir, './node_modules/@edx/paragon', 'dist', 'theme-urls.json');
  if (!fs.existsSync(pathToParagonThemeOutput)) {
    return undefined;
  }
  const paragonConfig = JSON.parse(fs.readFileSync(pathToParagonThemeOutput));
  const {
    core: themeCore,
    variants: themeVariants,
  } = paragonConfig?.themeUrls || {};

  const pathToCoreCss = path.resolve(dir, './node_modules/@edx/paragon', 'dist', themeCore.paths.minified);
  const coreCssExists = fs.existsSync(pathToCoreCss);

  const validThemeVariantPaths = Object.entries(themeVariants || {}).filter(([, value]) => {
    const themeVariantCssDefault = path.resolve(dir, './node_modules/@edx/paragon', 'dist', value.paths.default);
    const themeVariantCssMinified = path.resolve(dir, './node_modules/@edx/paragon', 'dist', value.paths.minified);
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
  validThemeVariantPaths.forEach(([themeVariant, value]) => {
    themeVariantResults[themeVariant] = {
      filePath: path.resolve(dir, './node_modules/@edx/paragon', 'dist', value.paths.minified),
      entryName: `paragon.theme.variants.${themeVariant}`,
      outputChunkName: `paragon-theme-variant-${themeVariant}`,
      default: value.default,
      dark: value.dark,
    };
  });

  return {
    core: fs.existsSync(pathToCoreCss) ? coreResult : undefined,
    variants: themeVariantResults,
  };
}

/**
 * Replaces all periods in a string with hyphens.
 * @param {string} str A string containing periods to replace with hyphens.
 * @returns The input string with periods replaced with hyphens.
 */
function replacePeriodsWithHyphens(str) {
  return str.replaceAll('.', '-');
}

/**
 * @typedef CacheGroup
 * @property {string} type The type of cache group.
 * @property {string|function} name The name of the cache group.
 * @property {function} chunks A function that returns true if the chunk should be included in the cache group.
 * @property {boolean} enforce If true, this cache group will be created even if it conflicts with default cache groups.
 */

/**
 * @param {ParagonThemeCss} paragonThemeCss The Paragon theme CSS metadata.
 * @returns {Object.<string, CacheGroup>} The cache groups for the Paragon theme CSS.
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

/**
 * @param {ParagonThemeCss} paragonThemeCss The Paragon theme CSS metadata.
 * @returns {Object.<string, string>} The entry points for the Paragon theme CSS. Example: ```
 * {
 *   "paragon.theme.core": "/path/to/node_modules/@edx/paragon/dist/core.min.css",
 *   "paragon.theme.variants.light": "/path/to/node_modules/@edx/paragon/dist/light.min.css"
 * }
 * ```
 */
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
