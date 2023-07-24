const { Compilation, sources } = require('webpack');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const {
  getParagonVersion,
  getParagonThemeCss,
} = require('../../../config/data/paragonUtils');
const {
  injectMetadataIntoDocument,
  // getMfeRuntimeConfig,
  getParagonStylesheetUrls,
  injectParagonCoreStylesheets,
  injectParagonThemeVariantStylesheets,
} = require('./utils');
const resolvePrivateEnvConfig = require('../../resolvePrivateEnvConfig');

// Add process env vars. Currently used only for setting the
// server port and the publicPath
dotenv.config({
  path: path.resolve(process.cwd(), '.env.development'),
});

// Allow private/local overrides of env vars from .env.development for config settings
// that you'd like to persist locally during development, without the risk of checking
// in temporary modifications to .env.development.
resolvePrivateEnvConfig('.env.private');

// Resolve configuration `env.config`.
const envConfigFile = path.resolve(process.cwd(), 'env.config.js');

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
   * Resolves the MFE configuration for ``PARAGON_THEME_URLS`` in the following priority order:
   *
   * 1. ``mfeRuntimeApiConfig.PARAGON_THEME_URLS``
   * 2. ``envConfig.PARAGON_THEME_URLS``
   * 3. ``process.env.PARAGON_THEME_URLS``
   *
   * @returns {Object} Metadata about the Paragon and brand theme URLs from configuration.
   */
  async resolveParagonThemeUrlsFromConfig() {
    // const mfeRuntimeApiConfig = await getMfeRuntimeConfig();
    let envConfig;
    if (fs.existsSync(envConfigFile)) {
      envConfig = require(envConfigFile);
    }
    // const paragonThemeUrls = mfeRuntimeApiConfig?.PARAGON_THEME_URLS
    //   ?? envConfig?.PARAGON_THEME_URLS
    //   ?? process.env.PARAGON_THEME_URLS;

    const paragonThemeUrls = envConfig?.PARAGON_THEME_URLS ?? process.env.PARAGON_THEME_URLS;

    this.paragonThemeUrlsConfig = paragonThemeUrls;
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
      fallbackUrls: {
        default: this.paragonMetadata?.paragon.themeUrls.core.fileName,
        brandOverride: this.paragonMetadata?.brand.themeUrls.core.fileName,
      },
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
