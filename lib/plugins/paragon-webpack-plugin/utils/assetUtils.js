/**
 * Finds the core CSS asset from the given array of Paragon assets.
 *
 * @param {Array} paragonAssets - An array of Paragon assets.
 * @return {Object|undefined} The core CSS asset, or undefined if not found.
 */
function findCoreCssAsset(paragonAssets) {
  return paragonAssets?.find((asset) => asset.name.includes('core') && asset.name.endsWith('.css'));
}

/**
 * Finds the theme variant CSS assets from the given Paragon assets based on the provided options.
 *
 * @param {Array} paragonAssets - An array of Paragon assets.
 * @param {Object} options - The options for finding the theme variant CSS assets.
 * @param {boolean} [options.isBrandOverride=false] - Indicates if the theme variant is a brand override.
 * @param {Object} [options.brandThemeCss] - The brand theme CSS object.
 * @param {Object} [options.paragonThemeCss] - The Paragon theme CSS object.
 * @return {Object} - The theme variant CSS assets.
 */
function findThemeVariantCssAssets(paragonAssets, {
  isBrandOverride = false,
  brandThemeCss,
  paragonThemeCss,
}) {
  const themeVariantsSource = isBrandOverride ? brandThemeCss?.variants : paragonThemeCss?.variants;
  const themeVariantCssAssets = {};
  Object.entries(themeVariantsSource || {}).forEach(([themeVariant, value]) => {
    const foundThemeVariantAsset = paragonAssets.find((asset) => asset.name.includes(value.outputChunkName));
    if (!foundThemeVariantAsset) {
      return;
    }
    themeVariantCssAssets[themeVariant] = {
      fileName: foundThemeVariantAsset.name,
    };
  });
  return themeVariantCssAssets;
}

/**
 * Retrieves the CSS assets from the compilation based on the provided options.
 *
 * @param {Object} compilation - The compilation object.
 * @param {Object} options - The options for retrieving the CSS assets.
 * @param {boolean} [options.isBrandOverride=false] - Indicates if the assets are for a brand override.
 * @param {Object} [options.brandThemeCss] - The brand theme CSS object.
 * @param {Object} [options.paragonThemeCss] - The Paragon theme CSS object.
 * @return {Object} - The CSS assets, including the core CSS asset and theme variant CSS assets.
 */
function getCssAssetsFromCompilation(compilation, {
  isBrandOverride = false,
  brandThemeCss,
  paragonThemeCss,
}) {
  const assetSubstring = isBrandOverride ? 'brand' : 'paragon';
  const paragonAssets = compilation.getAssets().filter(asset => asset.name.includes(assetSubstring) && asset.name.endsWith('.css'));
  const coreCssAsset = findCoreCssAsset(paragonAssets);
  const themeVariantCssAssets = findThemeVariantCssAssets(paragonAssets, {
    isBrandOverride,
    paragonThemeCss,
    brandThemeCss,
  });
  return {
    coreCssAsset: {
      fileName: coreCssAsset?.name,
    },
    themeVariantCssAssets,
  };
}

module.exports = {
  findCoreCssAsset,
  findThemeVariantCssAssets,
  getCssAssetsFromCompilation,
};
