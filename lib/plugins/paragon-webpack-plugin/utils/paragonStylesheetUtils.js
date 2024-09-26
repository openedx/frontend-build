const { insertStylesheetsIntoDocument } = require('./stylesheetUtils');
const { handleVersionSubstitution } = require('./tagUtils');

/**
 * Injects Paragon core stylesheets into the document.
 *
 * @param {Object} options - The options object.
 * @param {string|object} options.source - The source HTML document.
 * @param {Object} options.paragonCoreCss - The Paragon core CSS object.
 * @return {string|object} The modified HTML document with Paragon core stylesheets injected.
 */
function injectParagonCoreStylesheets({
  source,
  paragonCoreCss,
}) {
  return insertStylesheetsIntoDocument({
    source,
    urls: paragonCoreCss.urls,
  });
}

/**
 * Injects Paragon theme variant stylesheets into the document.
 *
 * @param {Object} options - The options object.
 * @param {string|object} options.source - The source HTML document.
 * @param {Object} options.paragonThemeVariantCss - The Paragon theme variant CSS object.
 * @param {Object} options.paragonThemeCss - The Paragon theme CSS object.
 * @param {Object} options.brandThemeCss - The brand theme CSS object.
 * @return {string|object} The modified HTML document with Paragon theme variant stylesheets injected.
 */
function injectParagonThemeVariantStylesheets({
  source,
  paragonThemeVariantCss,
}) {
  let newSource = source;
  Object.values(paragonThemeVariantCss).forEach(({ urls }) => {
    newSource = insertStylesheetsIntoDocument({
      source: typeof newSource === 'object' ? newSource.source() : newSource,
      urls,
    });
  });
  return newSource;
}
/**
 * Retrieves the URLs of the Paragon stylesheets based on the provided theme URLs, Paragon version, and brand version.
 *
 * @param {Object} options - The options object.
 * @param {Object} options.paragonThemeUrls - The URLs of the Paragon theme.
 * @param {string} options.paragonVersion - The version of the Paragon theme.
 * @param {string} options.brandVersion - The version of the brand theme.
 * @return {Object} An object containing the URLs of the Paragon stylesheets.
 */
function getParagonStylesheetUrls({ paragonThemeUrls, paragonVersion, brandVersion }) {
  const paragonCoreCssUrl = typeof paragonThemeUrls.core.urls === 'object' ? paragonThemeUrls.core.urls.default : paragonThemeUrls.core.url;
  const brandCoreCssUrl = typeof paragonThemeUrls.core.urls === 'object' ? paragonThemeUrls.core.urls.brandOverride : undefined;

  const defaultThemeVariants = paragonThemeUrls.defaults || {};

  const coreCss = {
    urls: {
      default: handleVersionSubstitution({ url: paragonCoreCssUrl, wildcardKeyword: '$paragonVersion', localVersion: paragonVersion }),
      brandOverride: handleVersionSubstitution({ url: brandCoreCssUrl, wildcardKeyword: '$brandVersion', localVersion: brandVersion }),
    },
  };

  const themeVariantsCss = {};
  const themeVariantsEntries = Object.entries(paragonThemeUrls.variants || {});
  themeVariantsEntries.forEach(([themeVariant, { url, urls }]) => {
    const themeVariantMetadata = { urls: null };
    if (url) {
      themeVariantMetadata.urls = {
        default: handleVersionSubstitution({
          url,
          wildcardKeyword: '$paragonVersion',
          localVersion: paragonVersion,
        }),
        // If there is no brand override URL, then we don't need to do any version substitution
        // but we still need to return the property.
        brandOverride: undefined,
      };
    } else {
      themeVariantMetadata.urls = {
        default: handleVersionSubstitution({
          url: urls.default,
          wildcardKeyword: '$paragonVersion',
          localVersion: paragonVersion,
        }),
        brandOverride: handleVersionSubstitution({
          url: urls.brandOverride,
          wildcardKeyword: '$brandVersion',
          localVersion: brandVersion,
        }),
      };
    }
    themeVariantsCss[themeVariant] = themeVariantMetadata;
  });

  return {
    core: coreCss,
    variants: themeVariantsCss,
    defaults: defaultThemeVariants,
  };
}

module.exports = {
  injectParagonCoreStylesheets,
  injectParagonThemeVariantStylesheets,
  getParagonStylesheetUrls,
};
