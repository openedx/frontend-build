const parse5 = require('parse5');
const { sources } = require('webpack');

const { getDescendantByTag } = require('./tagUtils');

/**
 * Finds the insertion point for a stylesheet in an HTML document.
 *
 * @param {Object} options - The options object.
 * @param {Object} options.document - The parsed HTML document.
 * @param {string} options.source - The original source code of the HTML document.
 * @throws {Error} If the head element is missing in the HTML document.
 * @return {number} The insertion point for the stylesheet in the HTML document.
 */
function findStylesheetInsertionPoint({ document, source }) {
  const headElement = getDescendantByTag(document, 'head');
  if (!headElement) {
    throw new Error('Missing head element in index.html.');
  }

  // determine script insertion point
  if (headElement.sourceCodeLocation?.startTag) {
    return headElement.sourceCodeLocation.startTag.endOffset;
  }

  // less accurate fallback
  const headTagString = '<head>';
  const headTagIndex = source.indexOf(headTagString);
  return headTagIndex + headTagString.length;
}

/**
 * Inserts stylesheets into an HTML document.
 *
 * @param {object} options - The options for inserting stylesheets.
 * @param {string} options.source - The HTML source code.
 * @param {object} options.urls - The URLs of the stylesheets to be inserted.
 * @param {string} options.urls.default - The URL of the default stylesheet.
 * @param {string} options.urls.brandOverride - The URL of the brand override stylesheet.
 * @return {object} The new source code with the stylesheets inserted.
 */
function insertStylesheetsIntoDocument({
  source,
  urls,
}) {
  // parse file as html document
  const document = parse5.parse(source, {
    sourceCodeLocationInfo: true,
  });
  if (!getDescendantByTag(document, 'head')) {
    return undefined;
  }

  const newSource = new sources.ReplaceSource(
    new sources.RawSource(source),
    'index.html',
  );

  // insert the brand overrides styles into the HTML document
  const stylesheetInsertionPoint = findStylesheetInsertionPoint({
    document,
    source: newSource,
  });

  /**
   * Creates a new stylesheet link element.
   *
   * @param {string} url - The URL of the stylesheet.
   * @return {string} The HTML code for the stylesheet link element.
   */
  function createNewStylesheet(url) {
    const baseLink = `<link
      type="text/css"
      rel="preload"
      as="style"
      href="${url}"
      onerror="this.remove();"
    />`;
    return baseLink;
  }

  if (urls.default) {
    const existingDefaultLink = getDescendantByTag(`link[href='${urls.default}']`);
    if (!existingDefaultLink) {
      // create link to inject into the HTML document
      const stylesheetLink = createNewStylesheet(urls.default);
      newSource.insert(stylesheetInsertionPoint, stylesheetLink);
    }
  }

  if (urls.brandOverride) {
    const existingBrandLink = getDescendantByTag(`link[href='${urls.brandOverride}']`);
    if (!existingBrandLink) {
      // create link to inject into the HTML document
      const stylesheetLink = createNewStylesheet(urls.brandOverride);
      newSource.insert(stylesheetInsertionPoint, stylesheetLink);
    }
  }

  return newSource;
}

module.exports = {
  findStylesheetInsertionPoint,
  insertStylesheetsIntoDocument,
};
