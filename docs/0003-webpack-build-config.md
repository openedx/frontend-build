# Webpack Build Configuration

## Summary

We are implementing a caching mechanism in our Webpack configuration to significantly reduce build times.

## Context

Currently, our builds are functioning properly, but any changes made to the MFEs (Micro Frontend Applications) result in the same or even longer build times. Therefore, it is an opportune moment to improve this aspect.

# Decision

We will introduce a caching feature to the `createConfig.js` file in `@edx/frontend-build`. This file is already implemented in most MFEs, making it convenient to enable or disable the feature on a per-MFE basis. Initially, the feature will be implemented in the production environment, but it can also be added to the development environment.


[Webpack cache dock](https://webpack.js.org/configuration/cache/#cachecachedirectory)

# Implementation

To implement this feature, we will utilize the `cache` property in our Webpack configuration. We will use the filesystem type and specify a `cacheDirectory`, which will create a `.cache` directory within each MFE that has the feature enabled. To enable the feature, you need to add a new environment variable to your `.env` file with the following content:

```
ENABLE_WEBPACK_CACHE=''
```

# Follow-on Work

After implementing this feature, remember to add `.cache` to the `.gitignore` file for MFEs that have the caching feature enabled. Additionally, consider extending this feature to the development environment since its scope is currently limited to the production environment.
