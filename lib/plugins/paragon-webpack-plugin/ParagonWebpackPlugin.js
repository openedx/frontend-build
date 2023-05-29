const { Compilation, sources } = require('webpack');
const parse5 = require('parse5');
const {
  getParagonVersion,
  getParagonThemeCss,
  replacePeriodsWithHyphens,
} = require('../../../config/data/paragonUtils');

const paragonVersion = getParagonVersion(process.cwd());
const paragonThemeCss = getParagonThemeCss(process.cwd());

class ParagonWebpackPlugin {
  constructor() {
    this.version = paragonVersion;
    this.coreEntryName = undefined;
    this.themeVariantEntryNames = {};

    if (!paragonThemeCss) {
      return;
    }

    this.coreEntryName = replacePeriodsWithHyphens(paragonThemeCss.core.entryName);
    Object.entries(paragonThemeCss.variants).forEach(([key, value]) => {
      this.themeVariantEntryNames[key] = {
        entryName: replacePeriodsWithHyphens(value.entryName),
        default: value.default,
        dark: value.dark,
      };
    });
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

  getParagonCssAssetsFromCompilation(compilation) {
    const paragonAssets = compilation.getAssets().filter(asset => asset.name.includes('paragon') && asset.name.endsWith('.css'));
    const coreCssAsset = paragonAssets.find((asset) => asset.name.includes(this.coreEntryName));

    const themeVariantCssAssets = {};
    Object.entries(this.themeVariantEntryNames).forEach(([themeVariant, value]) => {
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
        var PARAGON = ${JSON.stringify(scriptContents, null, 2)};
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
            coreCssAsset,
            themeVariantCssAssets,
          } = this.getParagonCssAssetsFromCompilation(compilation);

          const originalSource = file.source.source();
          let newSource;
          if (!coreCssAsset || !Object.keys(themeVariantCssAssets).length === 0) {
            newSource = this.insertParagonScriptIntoDocument({
              originalSource,
              scriptContents: undefined,
            });
          } else {
            const scriptContents = {
              version: this.version,
              themeUrls: {
                core: coreCssAsset,
                variants: themeVariantCssAssets,
              },
            };
            newSource = this.insertParagonScriptIntoDocument({
              originalSource,
              coreCssAsset,
              themeVariantCssAssets,
              scriptContents,
            });
          }
          compilation.updateAsset('index.html', new sources.RawSource(newSource.source()));
        },
      );
    });
  }
}

module.exports = ParagonWebpackPlugin;
