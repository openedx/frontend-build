const { Compilation, sources } = require('webpack');
const parse5 = require('parse5');
const {
  getParagonVersion,
  getParagonThemeCss,
  replacePeriodsWithHyphens,
} = require('../../../config/data/paragonUtils');

const paragonVersion = getParagonVersion(process.cwd());
const paragonThemeCss = getParagonThemeCss(process.cwd());

const brandVersion = getParagonVersion(process.cwd(), { isBrandOverride: true });
const brandThemeCss = getParagonThemeCss(process.cwd(), { isBrandOverride: true });

class ParagonWebpackPlugin {
  constructor() {
    this.paragon = {
      version: paragonVersion,
      coreEntryName: undefined,
      themeVariantEntryNames: {},
    };

    this.brand = {
      version: brandVersion,
      coreEntryName: undefined,
      themeVariantEntryNames: {},
    };

    if (!paragonThemeCss && !brandThemeCss) {
      return;
    }

    if (paragonThemeCss) {
      // Core Paragon
      this.paragon.coreEntryName = replacePeriodsWithHyphens(paragonThemeCss.core.entryName);
      Object.entries(paragonThemeCss.variants).forEach(([key, value]) => {
        this.paragon.themeVariantEntryNames[key] = {
          entryName: replacePeriodsWithHyphens(value.entryName),
          default: value.default,
          dark: value.dark,
        };
      });
    }

    if (brandThemeCss) {
      // `@edx/brand` overrides
      this.brand.coreEntryName = replacePeriodsWithHyphens(brandThemeCss.core.entryName);
      Object.entries(brandThemeCss.variants).forEach(([key, value]) => {
        this.brand.themeVariantEntryNames[key] = {
          entryName: replacePeriodsWithHyphens(value.entryName),
          default: value.default,
          dark: value.dark,
        };
      });
    }
  }

  logger(message) {
    console.log('[ParagonWebpackPlugin]', message);
  }

  getDescendantByTag(node, tag) {
    for (let i = 0; i < node.childNodes?.length; i++) {
      if (node.childNodes[i].tagName === tag) {
        return node.childNodes[i];
      }
      const result = this.getDescendantByTag(node.childNodes[i], tag);
      if (result) {
        return result;
      }
    }
    return null;
  }

  getParagonCssAssetsFromCompilation(compilation, { isBrandOverride = false } = {}) {
    const assetSubstring = isBrandOverride ? 'brand' : 'paragon';
    const paragonAssets = compilation.getAssets().filter(asset => asset.name.includes(assetSubstring) && asset.name.endsWith('.css'));
    const coreCssAsset = paragonAssets.find((asset) => asset.name.includes(this[assetSubstring].coreEntryName));

    const themeVariantCssAssets = {};
    Object.entries(this[assetSubstring].themeVariantEntryNames).forEach(([themeVariant, value]) => {
      const foundThemeVariantAsset = paragonAssets.find((asset) => asset.name.includes(value.entryName));
      if (!foundThemeVariantAsset) {
        return;
      }
      themeVariantCssAssets[themeVariant] = {
        fileName: foundThemeVariantAsset.name,
        default: value.default,
        dark: value.dark,
      };
    });

    if (!coreCssAsset || !Object.keys(themeVariantCssAssets).length === 0) {
      return {
        coreCssAsset: undefined,
        themeVariantCssAssets: {},
      };
    }

    return {
      coreCssAsset: {
        fileName: coreCssAsset?.name,
      },
      themeVariantCssAssets,
    };
  }

  findScriptInsertionPoint({ document, originalSource }) {
    const bodyElement = this.getDescendantByTag(document, 'body');
    if (!bodyElement) {
      throw new Error('Missing body element in index.html');
    }

    // determine script insertion point
    if (bodyElement.sourceCodeLocation?.endTag) {
      return bodyElement.sourceCodeLocation.endTag.startOffset;
    }

    // less accurate fallback
    return originalSource.indexOf('</body>');
  }

  minifyScript(script) {
    return script
      .replace(/>[\r\n ]+</g, '><')
      .replace(/(<.*?>)|\s+/g, (m, $1) => {
        if ($1) { return $1; }
        return ' ';
      })
      .trim();
  }

  insertParagonScriptIntoDocument({
    originalSource,
    scriptContents,
  }) {
    // parse file as html document
    const document = parse5.parse(originalSource, {
      sourceCodeLocationInfo: true,
    });

    // find the body element
    const scriptInsertionPoint = this.findScriptInsertionPoint({
      document,
      originalSource,
    });

    // create Paragon script to inject into the HTML document
    const paragonScript = `
      <script type="text/javascript">
        var PARAGON_THEME = ${JSON.stringify(scriptContents, null, 2)};
      </script>
    `;

    // insert the Paragon script into the HTML document
    const newSource = new sources.ReplaceSource(
      new sources.RawSource(originalSource),
      'index.html',
    );
    newSource.insert(scriptInsertionPoint, this.minifyScript(paragonScript));
    return newSource;
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap('ParagonWebpackPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'ParagonWebpackPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
          additionalAssets: true,
        },
        () => {
          const file = compilation.getAsset('index.html');
          if (!file) {
            return;
          }
          const {
            coreCssAsset: paragonCoreCssAsset,
            themeVariantCssAssets: paragonThemeVariantCssAssets,
          } = this.getParagonCssAssetsFromCompilation(compilation);

          const {
            coreCssAsset: brandCoreCssAsset,
            themeVariantCssAssets: brandThemeVariantCssAssets,
          } = this.getParagonCssAssetsFromCompilation(compilation, { isBrandOverride: true });

          let scriptContents;
          const createEmptyScriptContentsIfUndefined = () => {
            if (!scriptContents) {
              scriptContents = {};
            }
          };
          const originalSource = file.source.source();

          if (paragonCoreCssAsset && Object.keys(paragonThemeVariantCssAssets).length > 0) {
            createEmptyScriptContentsIfUndefined();
            scriptContents.paragon = {
              version: this.paragon.version,
              themeUrls: {
                core: paragonCoreCssAsset,
                variants: paragonThemeVariantCssAssets,
              },
            };
          }

          if (brandCoreCssAsset && Object.keys(brandThemeVariantCssAssets).length > 0) {
            createEmptyScriptContentsIfUndefined();
            scriptContents.brand = {
              version: this.brand.version,
              themeUrls: {
                core: brandCoreCssAsset,
                variants: brandThemeVariantCssAssets,
              },
            };
          }

          const newSource = this.insertParagonScriptIntoDocument({
            originalSource,
            coreCssAsset: paragonCoreCssAsset,
            themeVariantCssAssets: paragonThemeVariantCssAssets,
            scriptContents,
          });
          compilation.updateAsset('index.html', new sources.RawSource(newSource.source()));
        },
      );
    });
  }
}

module.exports = ParagonWebpackPlugin;
