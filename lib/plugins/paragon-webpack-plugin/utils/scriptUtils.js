const { sources } = require('webpack');
const parse5 = require('parse5');

const { getDescendantByTag, minifyScript } = require('./tagUtils');

/**
 * Finds the insertion point for a script in an HTML document.
 *
 * @param {Object} options - The options object.
 * @param {Document} options.document - The parsed HTML document.
 * @param {string} options.originalSource - The original source code of the HTML document.
 * @throws {Error} If the body element is missing in the HTML document.
 * @return {number} The insertion point for the script in the HTML document.
 */
function findScriptInsertionPoint({ document, originalSource }) {
  const bodyElement = getDescendantByTag(document, 'body');
  if (!bodyElement) {
    throw new Error('Missing body element in index.html.');
  }

  // determine script insertion point
  if (bodyElement.sourceCodeLocation?.endTag) {
    return bodyElement.sourceCodeLocation.endTag.startOffset;
  }

  // less accurate fallback
  return originalSource.indexOf('</body>');
}

/**
 * Inserts the given script contents into the HTML document and returns a new source with the modified content.
 *
 * @param {Object} options - The options object.
 * @param {string} options.originalSource - The original HTML source.
 * @param {Object} options.scriptContents - The contents of the script to be inserted.
 * @return {sources.ReplaceSource} The new source with the modified HTML content.
 */
function insertScriptContentsIntoDocument({
  originalSource,
  scriptContents,
}) {
  // parse file as html document
  const document = parse5.parse(originalSource, {
    sourceCodeLocationInfo: true,
  });

  // find the body element
  const scriptInsertionPoint = findScriptInsertionPoint({
    document,
    originalSource,
  });

  // create Paragon script to inject into the HTML document
  const paragonScript = `<script type="text/javascript">var PARAGON_THEME = ${JSON.stringify(scriptContents, null, 2)};</script>`;

  // insert the Paragon script into the HTML document
  const newSource = new sources.ReplaceSource(
    new sources.RawSource(originalSource),
    'index.html',
  );
  newSource.insert(scriptInsertionPoint, minifyScript(paragonScript));
  return newSource;
}

/**
 * Creates an object with the provided version, defaults, coreCssAsset, and themeVariantCssAssets
 * and returns it. The returned object has the following structure:
 * {
 *   version: The provided version,
 *   themeUrls: {
 *     core: The provided coreCssAsset,
 *     variants: The provided themeVariantCssAssets,
 *     defaults: The provided defaults
 *   }
 * }
 *
 * @param {Object} options - The options object.
 * @param {string} options.version - The version to be added to the returned object.
 * @param {Object} options.defaults - The defaults to be added to the returned object.
 * @param {Object} options.coreCssAsset - The coreCssAsset to be added to the returned object.
 * @param {Object} options.themeVariantCssAssets - The themeVariantCssAssets to be added to the returned object.
 * @return {Object} The object with the provided version, defaults, coreCssAsset, and themeVariantCssAssets.
 */
function addToScriptContents({
  version,
  defaults,
  coreCssAsset,
  themeVariantCssAssets,
}) {
  return {
    version,
    themeUrls: {
      core: coreCssAsset,
      variants: themeVariantCssAssets,
      defaults,
    },
  };
}

/**
 * Generates the script contents object based on the provided assets and versions.
 *
 * @param {Object} options - The options object.
 * @param {Object} options.paragonCoreCssAsset - The asset for the Paragon core CSS.
 * @param {Object} options.paragonThemeVariantCssAssets - The assets for the Paragon theme variants.
 * @param {Object} options.brandCoreCssAsset - The asset for the brand core CSS.
 * @param {Object} options.brandThemeVariantCssAssets - The assets for the brand theme variants.
 * @param {Object} options.paragonThemeCss - The Paragon theme CSS.
 * @param {string} options.paragonVersion - The version of the Paragon theme.
 * @param {Object} options.brandThemeCss - The brand theme CSS.
 * @param {string} options.brandVersion - The version of the brand theme.
 * @return {Object} The script contents object.
 */
function generateScriptContents({
  paragonCoreCssAsset,
  paragonThemeVariantCssAssets,
  brandCoreCssAsset,
  brandThemeVariantCssAssets,
  paragonThemeCss,
  paragonVersion,
  brandThemeCss,
  brandVersion,
}) {
  const scriptContents = {};
  scriptContents.paragon = addToScriptContents({
    version: paragonVersion,
    coreCssAsset: paragonCoreCssAsset,
    themeVariantCssAssets: paragonThemeVariantCssAssets,
    defaults: paragonThemeCss?.defaults,
  });
  scriptContents.brand = addToScriptContents({
    version: brandVersion,
    coreCssAsset: brandCoreCssAsset,
    themeVariantCssAssets: brandThemeVariantCssAssets,
    defaults: brandThemeCss?.defaults,
  });
  return scriptContents;
}

module.exports = {
  addToScriptContents,
  insertScriptContentsIntoDocument,
  generateScriptContents,
};
