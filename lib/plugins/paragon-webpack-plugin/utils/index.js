const { getParagonStylesheetUrls, injectParagonCoreStylesheets, injectParagonThemeVariantStylesheets } = require('./paragonStylesheetUtils');
const { injectMetadataIntoDocument } = require('./htmlUtils');

module.exports = {
  injectMetadataIntoDocument,
  getParagonStylesheetUrls,
  injectParagonCoreStylesheets,
  injectParagonThemeVariantStylesheets,
};
