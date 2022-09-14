# JavaScript-based environment configuration

## Summary

We've decided to move forward with JavaScript-based environment configuration instead of `process.env`-based environment configuration because of significant limitations in the latter.

## Context

Today, the only way to configure micro-frontends for particular environments is via the `dotenv` library and its associated webpack plugin.

This mechanism makes use of `.env` files which are YAML-like files which dotenv reads in at build time.  It passes the values in the file into the app via `process.env` and the webpack DefinePlugin.

More details here: https://github.com/mrsteele/dotenv-webpack

This mechanism has a few important drawbacks:

1. It can only accept string values.  All values in the .env file are cast to strings as part of how DefinePlugin works.  This means that `false` and `null` becomes `"false"` and `"null"` respectively, which are _truthy_ values.  This behavior causes no end of developer confusion, not to mention significant regression risk if not used carefully.  It also means we need to have specialized code in the MFE to interpret the string `"false"` as a `false` value, which is also a fraught and brittle process.

2. We also don't make use of our .env files very well.  We use the values in `.env.development` for our development environments, but for production we use the `.env` file as a _fallback_ in case environment variables weren't defined on the command line when running `npm run build`.  There's no reason the fallback file should ever be used - it's an error to do so.  This is confusing and not consistent with how our development environments run.

3. A particularly limiting facet of #1 above is that because we can only accept string values, we have no reasonable way of configuring more complex data types that aren't easily cast from strings.  Booleans and Numbers are annoying, but if we want to configure an Array, Object, function, or class of some kind, we would have to encode that data type as a _string_ in a YAML file and then evaluate it in the app at runtime, which is completely unreasonable.

# Decision

We'd like to replace our `process.env` configuration with JavaScript-based configuration.  There is precedent for this in the frontend ecosystem - most libraries allow themselves to be configured by both JSON and JS files.  Eslint, Babel, Webpack, Commitlint, and many others all support this.  Using JS in particular is a powerful choice, as it allows the configuration file to import/require other resources, and lets us configure all the complex data types mentioned above.

We will still support `process.env`-based configuration for the time being.  Today, [frontend-platform](https://github.com/openedx/frontend-platform) is responsible for ingesting the `process.env` variables defined here in frontend-build, and we expect that we'll create a new configuration service in that library to handle this new type of configuration seamlessly and in a backwards compatible way.

# Implementation

This new mechanism is done via webpack's `resolve` rules, specifically `alias` and `fallback`.  We use the first rule to set up an alias for `"env.config"` and point it at a `env.config.js` file we expect to be in the root of the application being built with frontend-build.  If that file is not present, `fallback` is responsible for resolving it with an empty `env.config.js` file here in frontend-build, which provides an empty object of configuration values.

In this way, if an application doesn't know about or doesn't use `env.config.js`, it will seamlessly fallback to be a no-op.

Once in place, an application can do:

```
import config from 'env.config';
```

And it'll import the code from `env.config.js` if it's present, or the frontend-build version (which is an empty object `{}`) if it is not.

# Follow-on work

After getting this code committed to frontend-build, we'll want to consume it in frontend-platform.  This will probably take the form of a new "configuration service" interface with two implementations: the existing `process.env`-based implementation packaged into a class, and a new `env.config`-based implementation.  Cutting over from one to the other over time will have to be done in a backwards compatible way so that we can continue to support existing MFE builds.

We expect that we'll also want to update https://github.com/openedx/tubular to support this new mechanism.  Operators who want to take advantage of it may need to update any repositories that contain their environment-specific configurations as well.
