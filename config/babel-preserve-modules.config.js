module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
      },
    ],
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
  ],
  env: {
    i18n: {
      plugins: [
        [
          'formatjs',
          {
            messagesDir: './temp/babel-plugin-formatjs',
            moduleSourceName: '@edx/frontend-platform/i18n',
          },
        ],
      ],
    },
    test: {
      presets: [
        '@babel/preset-env',
      ],
    },
  },
};
