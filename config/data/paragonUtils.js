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
  const pathToCoreCss = `${dir}/node_modules/@edx/paragon/dist/core.min.css`;
  const pathToThemeVariantLightCss = `${dir}/node_modules/@edx/paragon/dist/light.min.css`;

  const coreCssExists = fs.existsSync(pathToCoreCss);
  const themeVariantLightCssExists = fs.existsSync(pathToThemeVariantLightCss);

  if (!coreCssExists || !themeVariantLightCssExists) {
    return undefined;
  }

  const coreResult = {
    filePath: path.resolve(__dirname, pathToCoreCss),
    entryName: 'paragonThemeCoreCss',
    outputChunkName: 'paragon-theme-core',
  };
  const themeVariantResults = {
    light: {
      filePath: path.resolve(__dirname, pathToThemeVariantLightCss),
      entryName: 'paragonThemeVariantLightCss',
      outputChunkName: 'paragon-theme-variant-light',
    },
  };

  return {
    core: fs.existsSync(pathToCoreCss) ? coreResult : undefined,
    variants: {
      light: fs.existsSync(pathToThemeVariantLightCss) ? themeVariantResults.light : undefined,
    },
  };
}

/**
 * TODO
 */
function getParagonCacheGroups(paragonThemeCss) {
  const cacheGroups = {};
  if (!paragonThemeCss) {
    return cacheGroups;
  }
  const getCacheGroupName = (module, _, cacheGroupKey) => {
    const buildHash = module.buildInfo.hash;
    const moduleFileName = module
      .identifier()
      .split('/')
      .reduceRight((item) => item)
      .split('|')[0]
      .split('.css')[0];
    const outputChunkFilename = `${cacheGroupKey}.${buildHash}.${moduleFileName}`;
    return outputChunkFilename;
  };

  cacheGroups[paragonThemeCss.core.entryName] = {
    type: 'css/mini-extract',
    name: getCacheGroupName,
    chunks: chunk => chunk.name === paragonThemeCss.core.entryName,
    enforce: true,
  };
  cacheGroups[paragonThemeCss.variants.light.entryName] = {
    type: 'css/mini-extract',
    name: getCacheGroupName,
    chunks: chunk => chunk.name === paragonThemeCss.variants.light.entryName,
    enforce: true,
  };

  return cacheGroups;
}

function getParagonEntryPoints(paragonThemeCss) {
  const entryPoints = {};
  if (!paragonThemeCss) {
    return entryPoints;
  }
  entryPoints[paragonThemeCss.core.entryName] = path.resolve(process.cwd(), paragonThemeCss.core.filePath);
  entryPoints[paragonThemeCss.variants.light.entryName] = path.resolve(
    process.cwd(),
    paragonThemeCss.variants.light.filePath,
  );
  return entryPoints;
}

module.exports = {
  getParagonVersion,
  getParagonThemeCss,
  getParagonCacheGroups,
  getParagonEntryPoints,
};
