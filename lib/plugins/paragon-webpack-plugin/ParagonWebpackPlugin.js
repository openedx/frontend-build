const { Compilation, sources } = require('webpack');
const {
  getParagonVersion,
  getParagonThemeCss,
} = require('../../../config/data/paragonUtils');
const {
  injectMetadataIntoDocument,
  getParagonStylesheetUrls,
  injectParagonCoreStylesheets,
  injectParagonThemeVariantStylesheets,
} = require('./utils');

// Get Paragon and brand versions / CSS files from disk.
const paragonVersion = getParagonVersion(process.cwd());
const paragonThemeCss = getParagonThemeCss(process.cwd());
const brandVersion = getParagonVersion(process.cwd(), { isBrandOverride: true });
const brandThemeCss = getParagonThemeCss(process.cwd(), { isBrandOverride: true });

/**
 * 1. Injects `PARAGON_THEME` global variable into the HTML document during the Webpack compilation process.
 * 2. Injects `<link rel="preload" as="style">` element(s) for the Paragon and brand CSS into the HTML document.
 */
class ParagonWebpackPlugin {
  constructor({ processAssetsHandlers = [] } = {}) {
    this.pluginName = 'ParagonWebpackPlugin';
    this.paragonThemeUrlsConfig = {};
    this.paragonMetadata = {};

    // List of handlers to be executed after processing assets during the Webpack compilation.
    this.processAssetsHandlers = [
      this.resolveParagonThemeUrlsFromConfig,
      this.injectParagonMetadataIntoDocument,
      this.injectParagonStylesheetsIntoDocument,
      ...processAssetsHandlers,
    ].map(handler => handler.bind(this));
  }

  /**
   * Resolves the MFE configuration from ``PARAGON_THEME_URLS`` in the environment variables. `
   *
   * @returns {Object} Metadata about the Paragon and brand theme URLs from configuration.
   */
  async resolveParagonThemeUrlsFromConfig() {
    try {
      this.paragonThemeUrlsConfig = JSON.parse(process.env.PARAGON_THEME_URLS);
    } catch (error) {
      console.info('Paragon Plugin cannot load PARAGON_THEME_URLS env variable, skipping.');
    }
  }

  /**
   * Generates `PARAGON_THEME` global variable in HTML document.
   * @param {Object} compilation Webpack compilation object.
   */
  injectParagonMetadataIntoDocument(compilation) {
    const paragonMetadata = injectMetadataIntoDocument(compilation, {
      paragonThemeCss,
      paragonVersion,
      brandThemeCss,
      brandVersion,
    });
    if (paragonMetadata) {
      this.paragonMetadata = paragonMetadata;
    }
  }

  injectParagonStylesheetsIntoDocument(compilation) {
    const file = compilation.getAsset('index.html');

    // If the `index.html` hasn't loaded yet, or there are no Paragon theme URLs, then there is nothing to do yet.
    if (!file || Object.keys(this.paragonThemeUrlsConfig || {}).length === 0) {
      return;
    }

    // Generates `<link rel="preload" as="style">` element(s) for the Paragon and brand CSS files.
    const paragonStylesheetUrls = getParagonStylesheetUrls({
      paragonThemeUrls: this.paragonThemeUrlsConfig,
      paragonVersion,
      brandVersion,
    });
    const {
      core: paragonCoreCss,
      variants: paragonThemeVariantCss,
    } = paragonStylesheetUrls;

    const originalSource = file.source.source();

    // Inject core CSS
    let newSource = injectParagonCoreStylesheets({
      source: originalSource,
      paragonCoreCss,
      paragonThemeCss,
      brandThemeCss,
    });

    // Inject theme variant CSS
    newSource = injectParagonThemeVariantStylesheets({
      source: newSource.source(),
      paragonThemeVariantCss,
      paragonThemeCss,
      brandThemeCss,
    });

    compilation.updateAsset('index.html', new sources.RawSource(newSource.source()));
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap(this.pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: this.pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
          additionalAssets: true,
        },
        () => {
          // Iterate through each configured handler, passing the compilation to each.
          this.processAssetsHandlers.forEach(async (handler) => {
            await handler(compilation);
          });
        },
      );
    });
  }
}

module.exports = ParagonWebpackPlugin;
