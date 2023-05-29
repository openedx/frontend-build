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
    if (!paragonThemeCss) {
      return;
    }
    this.coreEntryName = replacePeriodsWithHyphens(paragonThemeCss.core.entryName);
    this.themeVariantEntryNames = {};
    Object.entries(paragonThemeCss.variants).forEach(([key, value]) => {
      this.themeVariantEntryNames[key] = replacePeriodsWithHyphens(value.entryName);
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
    const coreCssAsset = paragonAssets.find((asset) => asset.name.includes(this.coreEntryName))?.name;

    const themeVariantCssAssets = {};
    Object.entries(this.themeVariantEntryNames).forEach(([themeVariant, themeVariantEntryName]) => {
      const foundThemeVariantAsset = paragonAssets.find((asset) => asset.name.includes(themeVariantEntryName));
      if (!foundThemeVariantAsset) {
        return;
      }
      themeVariantCssAssets[themeVariant] = foundThemeVariantAsset.name;
    });

    return {
      coreCssAsset,
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
    coreCssAsset,
    themeVariantCssAssets,
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

    // update index.html with new content
    const paragonScript = `
      <script type="text/javascript">
        var PARAGON = {
          version: '${this.version}',
          themeUrls: {
            core: '${coreCssAsset}',
            variants: ${JSON.stringify(themeVariantCssAssets, null, 2)},
          },
        };
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

          console.log('assets', {
            coreCssAsset,
            themeVariantCssAssets,
          });

          // TODO: assert at least one theme variant is defined in themeVariantAssets
          if (!coreCssAsset || !Object.keys(themeVariantCssAssets).length === 0) {
            this.logger("Unable to find `@edx/paragon`'s CSS in compilation assets. Skipping.");
            return;
          }

          const originalSource = file.source.source();
          const newSource = this.insertParagonScriptIntoDocument({
            originalSource,
            coreCssAsset,
            themeVariantCssAssets,
          });
          compilation.updateAsset('index.html', new sources.RawSource(newSource.source()));
        },
      );
    });
  }
}

module.exports = ParagonWebpackPlugin;
