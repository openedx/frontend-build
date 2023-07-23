const { Compilation, sources } = require('webpack');
const parse5 = require('parse5');
const {
  getParagonVersion,
  getParagonThemeCss,
} = require('../../../config/data/paragonUtils');

const paragonVersion = getParagonVersion(process.cwd());
const paragonThemeCss = getParagonThemeCss(process.cwd());

const brandVersion = getParagonVersion(process.cwd(), { isBrandOverride: true });
const brandThemeCss = getParagonThemeCss(process.cwd(), { isBrandOverride: true });

class ParagonWebpackPlugin {
  constructor() {
    this.paragon = {
      version: paragonVersion,
    };

    this.brand = {
      version: brandVersion,
    };
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

  findCoreCssAsset(paragonAssets) {
    return paragonAssets?.find((asset) => asset.name.includes('core') && asset.name.endsWith('.css'));
  }

  findThemeVariantCssAssets(paragonAssets, { isBrandOverride = false }) {
    const themeVariantsSource = isBrandOverride ? brandThemeCss?.variants : paragonThemeCss?.variants;
    const themeVariantCssAssets = {};
    Object.entries(themeVariantsSource).forEach(([themeVariant, value]) => {
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

  getParagonCssAssetsFromCompilation(compilation, { isBrandOverride = false } = {}) {
    const assetSubstring = isBrandOverride ? 'brand' : 'paragon';
    const paragonAssets = compilation.getAssets().filter(asset => asset.name.includes(assetSubstring) && asset.name.endsWith('.css'));
    const coreCssAsset = this.findCoreCssAsset(paragonAssets);
    const themeVariantCssAssets = this.findThemeVariantCssAssets(paragonAssets, { isBrandOverride });
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
      throw new Error('Missing body element in index.html.');
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

  insertScriptContentsIntoDocument({
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
    const paragonScript = `<script type="text/javascript">var PARAGON_THEME = ${JSON.stringify(scriptContents, null, 2)};</script>`;

    // insert the Paragon script into the HTML document
    const newSource = new sources.ReplaceSource(
      new sources.RawSource(originalSource),
      'index.html',
    );
    newSource.insert(scriptInsertionPoint, this.minifyScript(paragonScript));
    return newSource;
  }

  addToScriptContents({
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

          const scriptContents = {};
          scriptContents.paragon = this.addToScriptContents({
            version: this.paragon.version,
            coreCssAsset: paragonCoreCssAsset,
            themeVariantCssAssets: paragonThemeVariantCssAssets,
            defaults: paragonThemeCss.defaults,
          });
          scriptContents.brand = this.addToScriptContents({
            version: this.paragon.version,
            coreCssAsset: brandCoreCssAsset,
            themeVariantCssAssets: brandThemeVariantCssAssets,
            defaults: brandThemeCss.defaults,
          });

          const originalSource = file.source.source();
          console.log('scriptContents', JSON.stringify(scriptContents, null, 2));
          const newSource = this.insertScriptContentsIntoDocument({
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
