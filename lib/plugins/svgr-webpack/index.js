"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Adapted from https://github.com/gregberge/svgr/blob/main/packages/webpack/src/index.ts to remove babel
const util_1 = require("util");
const core_1 = require("@svgr/core");
const path_1 = require("path");
const plugin_svgo_1 = __importDefault(require("@svgr/plugin-svgo"));
const plugin_jsx_1 = __importDefault(require("@svgr/plugin-jsx"));
const tranformSvg = (0, util_1.callbackify)(async (contents, options, state) => {
    const jsCode = await (0, core_1.transform)(contents, options, state);
    return jsCode;
});
function svgrLoader(contents) {
    this.cacheable?.();
    const callback = this.async();
    const options = this.getOptions();
    const previousExport = (() => {
        if (contents.startsWith('export ')) {
            return contents;
        }
        const exportMatches = contents.match(/^module.exports\s*=\s*(.*)/);
        return exportMatches ? `export default ${exportMatches[1]}` : null;
    })();
    const state = {
        caller: {
            name: 'svgr-webpack-no-babel',
            previousExport,
            defaultPlugins: [plugin_svgo_1.default, plugin_jsx_1.default],
        },
        filePath: (0, path_1.normalize)(this.resourcePath),
    };
    if (!previousExport) {
        tranformSvg(contents, options, state, callback);
    }
    else {
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
exports.default = svgrLoader;
