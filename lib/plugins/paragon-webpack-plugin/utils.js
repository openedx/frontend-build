const { sources } = require('webpack');
const parse5 = require('parse5');
const axios = require('axios');

async function getMfeRuntimeConfig() {
  const {
    APP_ID,
    MFE_CONFIG_API_URL,
  } = process.env;
  const queryParams = new URLSearchParams({
    mfe: APP_ID,
  });
  const url = `${MFE_CONFIG_API_URL}?${queryParams.toString()}`;
  const response = await axios.get(url);
  return response.data;
}

function getDescendantByTag(node, tag) {
  for (let i = 0; i < node.childNodes?.length; i++) {
    if (node.childNodes[i].tagName === tag) {
      return node.childNodes[i];
    }
    const result = getDescendantByTag(node.childNodes[i], tag);
    if (result) {
      return result;
    }
  }
  return null;
}

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

function minifyScript(script) {
  return script
    .replace(/>[\r\n ]+</g, '><')
    .replace(/(<.*?>)|\s+/g, (m, $1) => {
      if ($1) { return $1; }
      return ' ';
    })
    .trim();
}

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

function findCoreCssAsset(paragonAssets) {
  return paragonAssets?.find((asset) => asset.name.includes('core') && asset.name.endsWith('.css'));
}

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

function handleVersionSubstitution({ url, wildcardKeyword, localVersion }) {
  if (!url || !url.includes(wildcardKeyword) || !localVersion) {
    return url;
  }
  return url.replace(wildcardKeyword, localVersion);
}

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

function injectParagonCoreStylesheets({
  source,
  paragonCoreCss,
  paragonThemeCss,
  brandThemeCss,
}) {
  return insertStylesheetsIntoDocument({
    source,
    urls: paragonCoreCss.urls,
    paragonThemeCss,
    brandThemeCss,
  });
}

function injectParagonThemeVariantStylesheets({
  source,
  paragonThemeVariantCss,
  paragonThemeCss,
  brandThemeCss,
}) {
  let newSource = source;
  Object.values(paragonThemeVariantCss).forEach(({ urls }) => {
    newSource = insertStylesheetsIntoDocument({
      source: typeof newSource === 'object' ? newSource.source() : newSource,
      urls,
      paragonThemeCss,
      brandThemeCss,
    });
  });
  return newSource;
}

module.exports = {
  injectMetadataIntoDocument,
  getMfeRuntimeConfig,
  getParagonStylesheetUrls,
  injectParagonCoreStylesheets,
  injectParagonThemeVariantStylesheets,
};
