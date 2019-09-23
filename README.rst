frontend-build
==============

|Build Status| |Codecov| |license|

This repository is under active development. The purpose of this package is to provide a common sense foundation and setup for frontend projects including:

- linting (eslint)
- testing (jest)
- development server (webpack-dev-server)
- build (webpack)

This package can serve as a single dev dependency replacing a large number of dev and build dependencies. It aims to provide common sense defaults that should be good for most edX projects out of the box, but can extended or overridden where needed.

package.json::

  {
     "scripts": {
        "build": "fedx-scripts webpack",
        "i18n_extract": "BABEL_ENV=i18n fedx-scripts babel src --quiet > /dev/null",
        "lint": "fedx-scripts eslint",
        "precommit": "npm run lint",
        "snapshot": "fedx-scripts jest --updateSnapshot",
        "start": "fedx-scripts webpack-dev-server --progress",
        "test": "fedx-scripts jest --coverage --passWithNoTests"
     },
     "dependencies": {
        ...
     },
     "devDependencies": {
        "@edx/frontend-build-tools": "1.0.0"
     }
  }

.. |Build Status| image:: https://api.travis-ci.org/edx/frontend-base.svg?branch=master
   :target: https://travis-ci.org/edx/frontend-base
.. |Codecov| image:: https://img.shields.io/codecov/c/github/edx/frontend-base
   :target: https://codecov.io/gh/edx/frontend-base
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-base.svg
   :target: https://github.com/edx/frontend-base/blob/master/LICENSE
