frontend-build
==============

|Build Status| |npm_version| |Codecov| |license|

The purpose of this package is to provide a common sense foundation and
setup for frontend projects including:

- linting (eslint)
- testing (jest)
- development server (webpack-dev-server)
- build (webpack)

This package can serve as a single dev dependency replacing a large number of
dev and build dependencies. It aims to provide common sense defaults that
should be good for most edX projects out of the box, but can extended or
overridden where needed.

Usage
-----

CLI commands are structured: ``fedx-scripts <targetScript> <options>``. Options
are passed on to the target script, so refer to each target script's cli
documentation to learn what options are available. Example package.json::

  {
     "scripts": {
        "build": "fedx-scripts webpack",
        "i18n_extract": "BABEL_ENV=i18n fedx-scripts babel src --quiet > /dev/null",
        "lint": "fedx-scripts eslint --ext .jsx,.js .",
        "precommit": "npm run lint",
        "snapshot": "fedx-scripts jest --updateSnapshot",
        "start": "fedx-scripts webpack-dev-server --progress",
        "test": "fedx-scripts jest --coverage --passWithNoTests"
     },
     "dependencies": {
        ...
     },
     "devDependencies": {
        "@edx/frontend-build": "1.0.0"
     }
  }

Extending or Overriding Config Presets
--------------------------------------

This package contains a set of configuration presets:

- webpack-prod (or webpack)
- webpack-dev (or webpack-dev-server)
- webpack-dev-stage (for running development apps against stage apis)
- babel
- babel-preserve-modules
- jest
- eslint

If you need to extend or modify a configuration you can add your
own configuration files, either by extending frontend-build's
configuration files or supplying your own wholesale.

Method 1: Extend base config (babel.config.js)::

   const { createConfig } = require('@edx/frontend-build');
   module.exports = createConfig('babel', {
      /* option overrides or extensions */
   });

Method 2: Custom manipulations (babel.config.js)::

   const { getBaseConfig } = require('@edx/frontend-build');
   const config = getBaseConfig('babel');

   /* Custom config manipulations */

   module.exports = config;

Frontend build will look in the following locations for configuration
files in your project.

- eslint: ``<project_root>/.eslintrc.js``
- jest: ``<project_root>/'jest.config.js``
- babel: ``<project_root>/'babel.config.js``
- webpack-prod: ``<project_root>/'webpack.prod.config.js``
- webpack-dev-server: ``<project_root>/'webpack.dev.config.js``

You may specify custom config file locations via the command
line if you prefer a different location. Example package.json::

  {
     "scripts": {
        "build": "fedx-scripts webpack --config ./config/webpack.config.js",
        "start:stage": "fedx-scripts webpack-dev-server --config webpack.dev-stage.config.js",
        ...
     }
  }

Note, specifying a custom config location for babel may cause issues with other
tools in frontend-build. eslint, jest, webpack, and webpack-dev-server configuration
presets rely upon the babel config and resolve the location of the config file
according to the default locations described above. If you need to move the babel
config file to a custom location, you may also need to customize references to its
location in other configuration files. Please reach out to the FedX team if you
need to do this and are running into problems.

Development
-----------

This project leverages the command line interface for webpack, jest, eslint, and babel.
Because of this, local development can be tricky. The easiest way to do local
development on this project is to either run scripts inside the project in example
or to test with an existing project you can do the following:

1. Delete the node_modules directories in the host project:
   ``rm -rf node_modules/``

2. Move frontend-build inside the host project and delete its node modules folder
   ``mv ../frontend-build ./ && rm -rf frontend-build/node_modules``

3. Install the development version of frontend-build
   ``npm i --save-dev @edx/frontend-build@file:./frontend-build``.


.. |Build Status| image:: https://api.travis-ci.org/edx/frontend-build.svg?branch=master
   :target: https://travis-ci.org/edx/frontend-build
.. |Codecov| image:: https://img.shields.io/codecov/c/github/edx/frontend-build
   :target: https://codecov.io/gh/edx/frontend-build
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-build.svg
   :target: https://github.com/edx/frontend-base/blob/master/LICENSE
.. |npm_version| image:: https://img.shields.io/npm/v/@edx/frontend-build.svg
