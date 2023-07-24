const path = require('path');
const fs = require('fs');

/**
 * Attempts to extract the Paragon version from the `node_modules` of
 * the consuming application.
 *
 * @param {string} dir Path to directory containing `node_modules`.
 * @returns {string} Paragon dependency version of the consuming application
 */
function getParagonVersion(dir, { isBrandOverride = false } = {}) {
  const npmPackageName = isBrandOverride ? '@edx/brand' : '@edx/paragon';
  const pathToPackageJson = `${dir}/node_modules/${npmPackageName}/package.json`;
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
function getParagonThemeCss(dir, { isBrandOverride = false } = {}) {
  const npmPackageName = isBrandOverride ? '@edx/brand' : '@edx/paragon';
  const pathToParagonThemeOutput = path.resolve(dir, 'node_modules', npmPackageName, 'dist', 'theme-urls.json');

  if (!fs.existsSync(pathToParagonThemeOutput)) {
    return undefined;
  }
  const paragonConfig = JSON.parse(fs.readFileSync(pathToParagonThemeOutput));
  const {
    core: themeCore,
    variants: themeVariants,
    defaults,
  } = paragonConfig?.themeUrls || {};

  const pathToCoreCss = path.resolve(dir, 'node_modules', npmPackageName, 'dist', themeCore.paths.minified);
  const coreCssExists = fs.existsSync(pathToCoreCss);

  const validThemeVariantPaths = Object.entries(themeVariants || {}).filter(([, value]) => {
    const themeVariantCssDefault = path.resolve(dir, 'node_modules', npmPackageName, 'dist', value.paths.default);
    const themeVariantCssMinified = path.resolve(dir, 'node_modules', npmPackageName, 'dist', value.paths.minified);
    return fs.existsSync(themeVariantCssDefault) && fs.existsSync(themeVariantCssMinified);
  });

  if (!coreCssExists || validThemeVariantPaths.length === 0) {
    return undefined;
  }
  const coreResult = {
    filePath: path.resolve(dir, pathToCoreCss),
    entryName: isBrandOverride ? 'brand.theme.core' : 'paragon.theme.core',
    outputChunkName: isBrandOverride ? 'brand-theme-core' : 'paragon-theme-core',
  };

  const themeVariantResults = {};
  validThemeVariantPaths.forEach(([themeVariant, value]) => {
    themeVariantResults[themeVariant] = {
      filePath: path.resolve(dir, 'node_modules', npmPackageName, 'dist', value.paths.minified),
      entryName: isBrandOverride ? `brand.theme.variants.${themeVariant}` : `paragon.theme.variants.${themeVariant}`,
      outputChunkName: isBrandOverride ? `brand-theme-variants-${themeVariant}` : `paragon-theme-variants-${themeVariant}`,
    };
  });

  return {
    core: fs.existsSync(pathToCoreCss) ? coreResult : undefined,
    variants: themeVariantResults,
    defaults,
  };
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
  cacheGroups[paragonThemeCss.core.outputChunkName] = {
    type: 'css/mini-extract',
    name: paragonThemeCss.core.outputChunkName,
    chunks: chunk => chunk.name === paragonThemeCss.core.entryName,
    enforce: true,
  };
  Object.values(paragonThemeCss.variants).forEach(({ entryName, outputChunkName }) => {
    cacheGroups[outputChunkName] = {
      type: 'css/mini-extract',
      name: outputChunkName,
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
};
