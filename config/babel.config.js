module.exports = {
  presets: [
    '@babel/preset-env',
    [
      '@babel/preset-react', {
        runtime: 'automatic',
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    [
      // Prevent importing large libraries by rewriting imports
      // Eventually, we should add 'preventFullImport": true' to each of these imports,
      // to prevent developers from committing full imports.
      'transform-imports',
      {
        // fortawesome
        '@fortawesome/free-brands-svg-icons': {
          transform: '@fortawesome/free-brands-svg-icons/${member}',
          skipDefaultConversion: true,
        },
        '@fortawesome/free-regular-svg-icons': {
          transform: '@fortawesome/free-regular-svg-icons/${member}',
          skipDefaultConversion: true,
        },
        '@fortawesome/free-solid-svg-icons': {
          transform: '@fortawesome/free-solid-svg-icons/${member}',
          skipDefaultConversion: true,
        },
        // lodash
        lodash: {
          transform: 'lodash/${member}',
        },
      },
    ],
  ],
  env: {
    i18n: {
      plugins: [
        [
          'formatjs',
        ],
      ],
    },
  },
};
