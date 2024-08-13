const { sources } = require('webpack');

const { getCssAssetsFromCompilation } = require('./assetUtils');
const { generateScriptContents, insertScriptContentsIntoDocument } = require('./scriptUtils');

/**
 * Injects metadata into the HTML document by modifying the 'index.html' asset in the compilation.
 *
 * @param {Object} compilation - The Webpack compilation object.
 * @param {Object} options - The options object.
 * @param {Object} options.paragonThemeCss - The Paragon theme CSS object.
 * @param {string} options.paragonVersion - The version of the Paragon theme.
 * @param {Object} options.brandThemeCss - The brand theme CSS object.
 * @param {string} options.brandVersion - The version of the brand theme.
 * @return {Object|undefined} The script contents object if the 'index.html' asset exists, otherwise undefined.
 */
function injectMetadataIntoDocument(compilation, {
  paragonThemeCss,
  paragonVersion,
  brandThemeCss,
  brandVersion,
}) {
  const file = compilation.getAsset('index.html');
  if (!file) {
    return undefined;
  }
  const {
    coreCssAsset: paragonCoreCssAsset,
    themeVariantCssAssets: paragonThemeVariantCssAssets,
  } = getCssAssetsFromCompilation(compilation, {
    brandThemeCss,
    paragonThemeCss,
  });
  const {
    coreCssAsset: brandCoreCssAsset,
    themeVariantCssAssets: brandThemeVariantCssAssets,
  } = getCssAssetsFromCompilation(compilation, {
    isBrandOverride: true,
    brandThemeCss,
    paragonThemeCss,
  });

  const scriptContents = generateScriptContents({
    paragonCoreCssAsset,
    paragonThemeVariantCssAssets,
    brandCoreCssAsset,
    brandThemeVariantCssAssets,
    paragonThemeCss,
    paragonVersion,
    brandThemeCss,
    brandVersion,
  });

  const originalSource = file.source.source();
  const newSource = insertScriptContentsIntoDocument({
    originalSource,
    coreCssAsset: paragonCoreCssAsset,
    themeVariantCssAssets: paragonThemeVariantCssAssets,
    scriptContents,
  });

  compilation.updateAsset('index.html', new sources.RawSource(newSource.source()));

  return scriptContents;
}

module.exports = {
  injectMetadataIntoDocument,
};
