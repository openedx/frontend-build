const { Compilation, sources } = require('webpack');
const parse5 = require('parse5');
const {
  getParagonVersion,
  getParagonThemeCss,
} = require('../../../config/data/paragonUtils');

const paragonVersion = getParagonVersion(process.cwd());
const paragonThemeCss = getParagonThemeCss(process.cwd());

class ParagonWebpackPlugin {
  constructor() {
    this.version = paragonVersion;
    if (paragonThemeCss) {
      this.coreEntryName = paragonThemeCss.core.entryName;
      this.themeVariantEntryNames = {};
      Object.entries(paragonThemeCss.variants).forEach(([key, value]) => {
        this.themeVariantEntryNames[key] = value.entryName;
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

          // get paragon assets
          const paragonAssets = compilation.getAssets().filter((asset) => asset.name.includes('paragon') && asset.name.endsWith('.css'));
          const coreCssAsset = paragonAssets.find((asset) => asset.name.includes(this.coreEntryName))?.name;
          const themeVariantLightAsset = paragonAssets.find((asset) => (
            asset.name.includes(this.themeVariantEntryNames.light)
          ))?.name;
          if (!coreCssAsset || !themeVariantLightAsset) {
            this.logger("Unable to find `@edx/paragon`'s CSS in compilation assets. Skipping.");
            return;
          }

          const originalSource = file.source.source();
          const newSource = new sources.ReplaceSource(
            new sources.RawSource(originalSource),
            'index.html',
          );

          // parse file as html document
          const document = parse5.parse(originalSource, {
            sourceCodeLocationInfo: true,
          });

          // find the body element
          const bodyElement = this.getDescendantByTag(document, 'body');
          if (!bodyElement) {
            throw new Error('Missing body element in index.html');
          }

          // determine script insertion point
          let scriptInsertionPoint;
          if (bodyElement.sourceCodeLocation?.endTag) {
            scriptInsertionPoint = bodyElement.sourceCodeLocation.endTag.startOffset;
          } else {
            // less accurate fallback
            scriptInsertionPoint = originalSource.indexOf('</body>');
          }

          // update index.html with new content
          const paragonScript = `
            <script type="text/javascript">
              var PARAGON = {
                version: '${this.version}',
                themeUrls: {
                  core: '${coreCssAsset}',
                  variants: {
                    light: '${themeVariantLightAsset}',
                  },
                },
              };
            </script>
          `
            // minify the above script
            .replace(/>[\r\n ]+</g, '><')
            .replace(/(<.*?>)|\s+/g, (m, $1) => {
              if ($1) { return $1; }
              return ' ';
            })
            .trim();

          // insert the Paragon script into the HTML document
          newSource.insert(scriptInsertionPoint, paragonScript);
          compilation.updateAsset('index.html', new sources.RawSource(newSource.source()));
        },
      );
    });
  }
}

module.exports = ParagonWebpackPlugin;
