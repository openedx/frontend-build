const { createConfig } = require('./');

module.exports = createConfig('eslint', {
  rules: {
    'no-console': 'off',
    'import/no-dynamic-require': 'off',
    'global-require': 'off',
    'no-template-curly-in-string': 'off',
  },
  "parserOptions": {
    "ecmaVersion": 2017
  },
  "env": {
    "es6": true
  },
});