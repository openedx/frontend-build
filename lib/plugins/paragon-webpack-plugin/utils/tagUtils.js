/**
 * Recursively searches for a descendant node with the specified tag name.
 *
 * @param {Element} node - The root node to start the search from.
 * @param {string} tag - The tag name to search for.
 * @return {Element|null} The first descendant node with the specified tag name, or null if not found.
 */
function getDescendantByTag(node, tag, attrs) {
  for (let i = 0; i < node.childNodes?.length; i++) {
    if (node.childNodes[i].tagName === tag) {
      if (!attrs || attrs.every(([attrName, attrValue]) => node.childNodes[i]
        .attrs?.some(({ name, value }) => name === attrName && value === attrValue))) {
        return node.childNodes[i];
      }
    }
    const result = getDescendantByTag(node.childNodes[i], tag, attrs);
    if (result) {
      return result;
    }
  }
  return null;
}

/**
 * Replaces a wildcard keyword in a URL with a local version.
 *
 * @param {Object} options - The options object.
 * @param {string} options.url - The URL to substitute the keyword in.
 * @param {string} options.wildcardKeyword - The wildcard keyword to replace.
 * @param {string} options.localVersion - The local version to substitute the keyword with.
 * @return {string} The URL with the wildcard keyword substituted with the local version,
 *                 or the original URL if no substitution is needed.
 */
function handleVersionSubstitution({ url, wildcardKeyword, localVersion }) {
  if (!url || !url.includes(wildcardKeyword) || !localVersion) {
    return url;
  }
  return url.replaceAll(wildcardKeyword, localVersion);
}

/**
 * Minifies a script by removing unnecessary whitespace and line breaks.
 *
 * @param {string} script - The script to be minified.
 * @return {string} The minified script.
 */
function minifyScript(script) {
  return script
    .replace(/>[\r\n ]+</g, '><')
    .replace(/(<.*?>)|\s+/g, (m, $1) => {
      if ($1) { return $1; }
      return ' ';
    })
    .trim();
}

module.exports = {
  getDescendantByTag,
  handleVersionSubstitution,
  minifyScript,
};
