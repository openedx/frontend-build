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
- jest: ``<project_root>/jest.config.js``
- babel: ``<project_root>/babel.config.js``
- webpack-prod: ``<project_root>/webpack.prod.config.js``
- webpack-dev-server: ``<project_root>/webpack.dev.config.js``

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

Local module configuration for Webpack
--------------------------------------

The development webpack configuration allows engineers to create a "module.config.js" file containing local module overrides.  This means that if you're developing a new feature in a shared library (@edx/frontend-platform, @edx/paragon, etc.), you can add the local location of that repository to your module.config.js file and the webpack build for your application will automatically pick it up and use it, rather than its node_modules version of the file.

**NOTE: This module.config.js file should be added to your** `.gitignore`.

An example module.config.js file looks like the following.  You can copy this into your application to use local versions of paragon and frontend-platform::

   module.exports = {
     /*
     Modules you want to use from local source code.  Adding a module here means that when this app
     runs its build, it'll resolve the source from peer directories of this app.

     moduleName: the name you use to import code from the module.
     dir: The relative path to the module's source code.
     dist: The sub-directory of the source code where it puts its build artifact.  Often "dist".
     */
     localModules: [
       { moduleName: '@edx/brand', dir: '../src/brand-openedx' }, // replace with your brand checkout
       { moduleName: '@edx/paragon/scss/core', dir: '../src/paragon', dist: 'scss/core' },
       { moduleName: '@edx/paragon/icons', dir: '../src/paragon', dist: 'icons' },
       { moduleName: '@edx/paragon', dir: '../src/paragon', dist: 'dist' },
       { moduleName: '@edx/frontend-platform', dir: '../src/frontend-platform', dist: 'dist' },
     ],
   };

Steps
~~~~~

#. Copy the ``module.config.js`` into your frontend app repository, modifying it as necessary.
#. Run ``npm install && npm run build`` within any shared NPM package you want to use locally.
#. Restart your app.

Notes
~~~~~

* The "dir" and "dist" keys give you granular control over the shape of your repository's distribution.  Paragon, for instance, needs two separate entries to pick up both JS and SCSS imports.
* The directory location ``../src`` (relative to the root of your frontend app repository) is recommended for shared NPM package repositories, since it will work whether or not you are running your frontend via devstack. If you are *not* running your frontend via devstack, then you can place your shared libraries anywhere in your file system, updating the "dir" key accordingly. To learn more, see `this devstack ADR on local packages`_.
* This mechanism uses Webpack resolve aliases, as documented here: https://webpack.js.org/configuration/resolve/#resolvealias

.. _this devstack ADR on local packages: https://github.com/edx/devstack/tree/master/docs/decisions/0005-frontend-package-mounts.rst

Override default .env.development environment variables with .env.private
-------------------------------------------------------------------------

In some situations, you may want to override development environment variables defined in .env.development
with private environment variables that should never be checked into a repository. For example, a
.env.development file may contain secrets for a third-party service (e.g., Algolia) that you'd like to use
during development but want to ensure these secrets are not checked into Git.

You may create a `.env.private` with any overrides of the environment settings configured in `.env.development`.

**Note: .env.private should be added to your project's .gitignore so it does not get checked in.**

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

.. |Build Status| image:: https://api.travis-ci.com/edx/frontend-build.svg?branch=master
   :target: https://travis-ci.com/edx/frontend-build
.. |Codecov| image:: https://img.shields.io/codecov/c/github/edx/frontend-build
   :target: https://codecov.io/gh/edx/frontend-build
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-build.svg
   :target: https://github.com/edx/frontend-base/blob/master/LICENSE
.. |npm_version| image:: https://img.shields.io/npm/v/@edx/frontend-build.svg
