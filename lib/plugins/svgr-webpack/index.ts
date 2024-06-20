// Adapted from https://github.com/gregberge/svgr/blob/main/packages/webpack/src/index.ts to remove babel
import { callbackify } from 'util';
import { transform, Config, State } from '@svgr/core';
import { normalize } from 'path';
import svgo from '@svgr/plugin-svgo';
import jsx from '@svgr/plugin-jsx';
import type * as webpack from 'webpack';

interface LoaderOptions extends Config {
//   babel?: boolean
}

const tranformSvg = callbackify(
  async (contents: string, options: LoaderOptions, state: Partial<State>) => {
    const jsCode = await transform(contents, options, state);
    return jsCode;
  },
);

function svgrLoader(
  this: webpack.LoaderContext<LoaderOptions>,
  contents: string,
): void {
  this.cacheable?.();
  const callback = this.async();

  const options = this.getOptions();

  const previousExport = (() => {
    if (contents.startsWith('export ')) { return contents; }
    const exportMatches = contents.match(/^module.exports\s*=\s*(.*)/);
    return exportMatches ? `export default ${exportMatches[1]}` : null;
  })();

  const state = {
    caller: {
      name: 'svgr-webpack-no-babel',
      previousExport,
      defaultPlugins: [svgo, jsx],
    },
    filePath: normalize(this.resourcePath),
  };

  if (!previousExport) {
    tranformSvg(contents, options, state, callback);
  } else {
    this.fs.readFile(this.resourcePath, (err, result) => {
      if (err) {
        callback(err);
        return;
      }
      tranformSvg(String(result), options, state, (err2, content) => {
        if (err2) {
          callback(err2);
          return;
        }
        callback(null, content);
      });
    });
  }
}

export default svgrLoader;
