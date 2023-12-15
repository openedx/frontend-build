# frontend-build

## Warning: Package Moved

While the Paragon design system will continue to receive updates, these updates
will no longer be published at the @edx/frontend-build NPM package. Instead, the
latest versions can be found with
[@openedx/frontend-build](https://www.npmjs.com/package/@openedx/frontend-build) instead.


[![Build
Status](https://api.travis-ci.com/edx/frontend-build.svg?branch=master)](https://travis-ci.com/edx/frontend-build)
![npm\_version](https://img.shields.io/npm/v/@edx/frontend-build.svg)
[![Codecov](https://img.shields.io/codecov/c/github/edx/frontend-build)](https://codecov.io/gh/edx/frontend-build)
[![license](https://img.shields.io/npm/l/@edx/frontend-build.svg)](https://github.com/edx-unsupported/frontend-base/blob/master/LICENSE)

## Purpose

The purpose of this package is to provide a common sense foundation and
setup for frontend projects including:

-   linting (eslint)
-   testing (jest)
-   development server (webpack-dev-server)
-   build (webpack)

This package can serve as a single dev dependency replacing a large
number of dev and build dependencies. It aims to provide common sense
defaults that should be good for most edX projects out of the box, but
can extended or overridden where needed.

## Cloning and Startup

``` {.}
1. Clone your new repo:

  ``git clone https://github.com/openedx/frontend-build.git``

2. Use node v18.x.

  The current version of the micro-frontend build scripts support node 18.
  Using other major versions of node *may* work, but this is unsupported.  For
  convenience, this repository includes an .nvmrc file to help in setting the
  correct node version via `nvm <https://github.com/nvm-sh/nvm>`_.

3. Install npm dependencies:

  ``cd frontend-build && npm ci``
```

## Usage

CLI commands are structured: `fedx-scripts <targetScript> <options>`.
Options are passed on to the target script, so refer to each target
script\'s CLI documentation to learn what options are available. Example
package.json:

    {
       "scripts": {
          "build": "fedx-scripts webpack",
          "i18n_extract": "fedx-scripts formatjs extract",
          "lint": "fedx-scripts eslint --ext .jsx,.js .",
          "precommit": "npm run lint",
          "snapshot": "fedx-scripts jest --updateSnapshot",
          "start": "fedx-scripts webpack-dev-server --progress",
          "test": "fedx-scripts jest --coverage --passWithNoTests",
          "serve": "fedx-scripts serve"
       },
       "dependencies": {
          ...
       },
       "devDependencies": {
          "@edx/frontend-build": "1.0.0"
       }
    }

## Extending or Overriding Config Presets

This package contains a set of configuration presets:

-   webpack-prod (or webpack)
-   webpack-dev (or webpack-dev-server)
-   webpack-dev-stage (for running development apps against stage apis)
-   babel
-   babel-preserve-modules
-   jest
-   eslint

If you need to extend or modify a configuration you can add your own
configuration files, either by extending frontend-build\'s configuration
files or supplying your own wholesale.

Method 1: Extend base config (babel.config.js):

    const { createConfig } = require('@edx/frontend-build');
    module.exports = createConfig('babel', {
       /* option overrides or extensions */
    });

Method 2: Custom manipulations (babel.config.js):

    const { getBaseConfig } = require('@edx/frontend-build');
    const config = getBaseConfig('babel');

    /* Custom config manipulations */

    module.exports = config;

Frontend build will look in the following locations for configuration
files in your project.

-   eslint: `<project_root>/.eslintrc.js`
-   jest: `<project_root>/jest.config.js`
-   babel: `<project_root>/babel.config.js`
-   webpack-prod: `<project_root>/webpack.prod.config.js`
-   webpack-dev-server: `<project_root>/webpack.dev.config.js`

You may specify custom config file locations via the command line if you
prefer a different location. Example package.json:

    {
       "scripts": {
          "build": "fedx-scripts webpack --config ./config/webpack.config.js",
          "start:stage": "fedx-scripts webpack-dev-server --config webpack.dev-stage.config.js",
          ...
       }
    }

Note, specifying a custom config location for babel may cause issues
with other tools in frontend-build. eslint, jest, webpack, and
webpack-dev-server configuration presets rely upon the babel config and
resolve the location of the config file according to the default
locations described above. If you need to move the babel config file to
a custom location, you may also need to customize references to its
location in other configuration files. Please reach out to the FedX team
if you need to do this and are running into problems.

## Local module configuration for Webpack


The development webpack configuration allows engineers to create a
\"module.config.js\" file containing local module overrides. This means
that if you\'re developing a new feature in a shared library
(\@edx/frontend-platform, \@edx/paragon, etc.), you can add the local
location of that repository to your module.config.js file and the
webpack build for your application will automatically pick it up and use
it, rather than its node\_modules version of the file.

**NOTE: This module.config.js file should be added to your**
[.gitignore]{.title-ref}.

An example module.config.js file looks like the following. You can copy
this into your application to use local versions of paragon and
frontend-platform:

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

## Steps

1.  Copy the `module.config.js` into your frontend app repository,
    modifying it as necessary.
2.  Run `npm install && npm run build` within any shared NPM package you
    want to use locally.
3.  Restart your app.

## Notes

-   The \"dir\" and \"dist\" keys give you granular control over the
    shape of your repository\'s distribution. Paragon, for instance,
    needs two separate entries to pick up both JS and SCSS imports.
-   The directory location `../src` (relative to the root of your
    frontend app repository) is recommended for shared NPM package
    repositories, since it will work whether or not you are running your
    frontend via devstack. If you are *not* running your frontend via
    devstack, then you can place your shared libraries anywhere in your
    file system, updating the \"dir\" key accordingly. To learn more,
    see [this devstack ADR on local
    packages](https://github.com/openedx/devstack/tree/master/docs/decisions/0005-frontend-package-mounts.rst).
-   This mechanism uses Webpack resolve aliases, as documented here:
    <https://webpack.js.org/configuration/resolve/#resolvealias>

## Override default .env.development environment variables with .env.private

In some situations, you may want to override development environment
variables defined in .env.development with private environment variables
that should never be checked into a repository. For example, a
.env.development file may contain secrets for a third-party service
(e.g., Algolia) that you\'d like to use during development but want to
ensure these secrets are not checked into Git.

You may create a [.env.private]{.title-ref} with any overrides of the
environment settings configured in [.env.development]{.title-ref}.

**Note: .env.private should be added to your project\'s .gitignore so it
does not get checked in.**

## Serving a production Webpack build locally

In some scenarios, you may want to run a production Webpack build
locally. To serve a production build locally:

1.  Create an `env.config.js` file containing the configuration for
    local development, with the exception of `NODE_ENV='production'`.
2.  Run `npm run build` to build the production assets. The output
    assets will rely on the local development configuration specified in
    the prior step.
3.  Add an NPM script `serve` to your application\'s `package.json`
    (i.e., `"serve": "fedx-scripts serve"`).
4.  Run `npm run serve` to serve your production build assets. It will
    attempt to run the build on the same port specified in the
    `env.config.js` file.

## Development

This project leverages the command line interface for webpack, jest,
eslint, and babel. Because of this, local development can be tricky. The
easiest way to do local development on this project is to either run
scripts inside the project in example or to test with an existing
project you can do the following:

1.  Delete the node\_modules directories in the host project:
    `rm -rf node_modules/`
2.  Move frontend-build inside the host project and delete its node
    modules folder
    `mv ../frontend-build ./ && rm -rf frontend-build/node_modules`
3.  Install the development version of frontend-build
    `npm i --save-dev @edx/frontend-build@file:./frontend-build`.

## License

The code in this repository is licensed under the AGPLv3 unless
otherwise noted.

Please see [LICENSE](LICENSE) for details.

## Contributing

Contributions are very welcome. Please read [How To
Contribute](https://openedx.org/r/how-to-contribute) for details.

This project is currently accepting all types of contributions, bug
fixes, security fixes, maintenance work, or new features. However,
please make sure to have a discussion about your new feature idea with
the maintainers prior to beginning development to maximize the chances
of your change being accepted. You can start a conversation by creating
a new issue on this repo summarizing your idea.

## Getting Help

If you\'re having trouble, we have discussion forums at
<https://discuss.openedx.org> where you can connect with others in the
community.

Our real-time conversations are on Slack. You can request a [Slack
invitation](https://openedx.org/slack), then join our [community Slack
workspace](https://openedx.slack.com/). Because this is a frontend
repository, the best place to discuss it would be in the [\#wg-frontend
channel](https://openedx.slack.com/archives/C04BM6YC7A6).

For anything non-trivial, the best path is to open an issue in this
repository with as many details about the issue you are facing as you
can provide.

<https://github.com/openedx/frontend-build/issues>

For more information about these options, see the [Getting
Help](https://openedx.org/community/connect) page.

## Reporting Security Issues

Please do not report security issues in public. Please email
<security@openedx.org>.

## Optimization

To increase optimization by reducing unused CSS, you can set
`USE_PURGECSS=true` in `.env` or as ENV var in the corresponding MFE.
However, note that doing this will increase build time by 30%. It\'s
thus not recommended to use this option during development. On the other
hand, enabling PurgeCSS will increase browser performance for the end
user by as much as 20% (as measured by
[lighthouse](https://developer.chrome.com/docs/lighthouse/overview/)).
Operators are encouraged to do so for production deployments.

For more information about optimizing MFEs, refer to the [issue
\#138](https://github.com/openedx/wg-frontend/issues/138) in the
wg-frontend repository.
