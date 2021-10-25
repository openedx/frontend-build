module.exports = {
  "extends": "@edx/eslint-config",
  "parser": "babel-eslint",
  "rules": {
    "import/no-extraneous-dependencies": [
      "error",
      {
        "devDependencies": [
          "**/*.config.*",
          "**/*.test.*",
          "**/setupTest.js",
        ],
      }
    ],
    "import/no-unresolved": [
      "error",
      {
        "ignore": [
          "env.config"
        ]
      }
    ],
    // https://github.com/evcohen/eslint-plugin-jsx-a11y/issues/340#issuecomment-338424908
    "jsx-a11y/anchor-is-valid": [ "error", {
      "components": [ "Link" ],
      "specialLink": [ "to" ]
    }],
  },
  "globals": {
    "newrelic": false
  }
}
