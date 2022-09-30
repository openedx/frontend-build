const { createConfig } = require('.');

module.exports = createConfig('eslint', {
  rules: {
    'no-console': 'off',
    'import/no-dynamic-require': 'off',
    'global-require': 'off',
    'no-template-curly-in-string': 'off',
    'import/no-import-module-export': 'off',
    'react/function-component-definition': [2, { 'namedComponents': 'arrow-function' }]
  },
});
