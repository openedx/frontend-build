module.exports = {
  FALSE_VALUE: false,
  CORRECT_BOOL_VALUE: 'Good, false meant false.  We did not cast a boolean to a string.',
  INCORRECT_BOOL_VALUE: 'Why was a false boolean true?',
  INTEGER_VALUE: 123,
  PARAGON_THEME_URLS: {
    core: {
      urls: {
        default: 'https://cdn.jsdelivr.net/npm/@openedx/paragon@alpha/dist/core.min.css',
        brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand-edx.org@alpha/dist/core.min.css',
      },
    },
    defaults: {
      light: 'light',
    },
    variants: {
      light: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@openedx/paragon@alpha/dist/light.min.css',
          brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand-edx.org@alpha/dist/light.min.css',
        },
      },
      dark: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@openedx/paragon@v21.0.0-alpha.40/dist/light.min.css',
          brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand-edx.org@2.2.0-alpha.13/dist/light.min.css',
        },
      },
    },
  },
};
