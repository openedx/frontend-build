import fs from 'fs';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';

import HtmlWebpackNewRelicPlugin from '../HtmlWebpackNewRelicPlugin';

const OUTPUT_DIR = path.join(__dirname, './dist');

describe('HtmlWebpackNewRelicPlugin', () => {
  const testPluginOptions = {
    accountID: '121212',
    agentID: '343434',
    trustKey: '565656',
    licenseKey: '123456',
    applicationID: '654321',
  };

  afterEach(() => {
    if (fs.existsSync(OUTPUT_DIR)) {
      fs.rmdirSync(OUTPUT_DIR, { recursive: true, force: true });
    }
  });

  it('should append new relic script to body', done => {
    webpack(
      {
        entry: path.resolve(__dirname, 'fixtures', 'entry.js'),
        output: {
          path: path.resolve(__dirname, './dist'),
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new HtmlWebpackNewRelicPlugin(testPluginOptions),
        ],
      },
      (err) => {
        const htmlFile = path.resolve(OUTPUT_DIR, 'index.html');
        expect(err).toBeNull();
        expect(fs.existsSync(htmlFile)).toBe(true);

        const file = fs.readFileSync(
          path.resolve(OUTPUT_DIR, htmlFile),
          { encoding: 'utf-8' },
          (error, data) => data.toString(),
        );

        Object.entries(testPluginOptions).forEach(([optionName, optionValue]) => {
          expect(file.indexOf(`${optionName}:"${optionValue}"`)).toBeGreaterThan(-1);
        });
        done();
      },
    );
  });

  describe('when its missing configuration variables', () => {
    function testMissingOption(missingOptionName) {
      it(`should throw error if ${missingOptionName} is missing`, done => {
        const compiler = webpack({
          entry: path.resolve(__dirname, 'fixtures', 'entry.js'),
          output: {
            path: path.resolve(__dirname, '../dist'),
          },
          plugins: [new HtmlWebpackPlugin()],
        });
        const optionsMissingOne = { ...testPluginOptions };
        delete optionsMissingOne[missingOptionName];
        expect(() => compiler.options.plugins.push(new HtmlWebpackNewRelicPlugin(optionsMissingOne))).toThrow(
          `${missingOptionName} argument is required`,
        );

        done();
      });
    }

    Object.keys(testPluginOptions).forEach((key) => {
      testMissingOption(key);
    });
  });
});
