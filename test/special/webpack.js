/* global describe, it */

import 'should';
import fs from 'fs';
import path from 'path';
import parse from '../../src/special/webpack';

const testCases = [
  {
    name: 'recognize single long-name webpack loader',
    deps: ['jade-loader'],
    module: {
      loaders: [
        { test: /\.jade$/, loader: 'jade-loader' },
      ],
    },
  },
  {
    name: 'recognize single short-name webpack loader',
    deps: ['jade-loader'],
    module: {
      loaders: [
        { test: /\.jade$/, loader: 'jade' },
      ],
    },
  },
  {
    name: 'recognize duplicated loader names',
    deps: ['jsx-loader'],
    module: {
      loaders: [
        { test: /\.js$/, loader: 'jsx' },
        { test: /\.jsx$/, loader: 'jsx' },
      ],
    },
  },
  {
    name: 'recognize multiple webpack loaders concatenated with exclamation',
    deps: ['style-loader', 'css-loader'],
    module: {
      loaders: [
        { test: /\.css$/, loader: 'style!css' },
      ],
    },
  },
  {
    name: 'recognize multiple webpack loaders within loaders property',
    deps: ['style-loader', 'css-loader'],
    module: {
      loaders: [
        { test: /\.css$/, loaders: ['style', 'css'] },
      ],
    },
  },
  {
    name: 'recognize webpack loader with query parameters',
    deps: ['url-loader'],
    module: {
      loaders: [
        { test: /\.png$/, loader: 'url-loader?mimetype=image/png' },
      ],
    },
  },
  {
    name: 'recognize webpack loaders in preLoaders and postLoaders properties',
    deps: ['pre-webpack-loader', 'post-webpack-loader'],
    module: {
      preLoaders: [
        { test: /\.pre$/, loader: 'pre' },
      ],
      postLoaders: [
        { test: /\.post$/, loader: 'post' },
      ],
    },
  },
];

function getTempPath(filename, content) {
  const tempFolder = path.resolve(__dirname, `temp-${Date.now()}`);
  const tempPath = path.resolve(tempFolder, filename);
  fs.mkdirSync(tempFolder);
  fs.writeFileSync(tempPath, content);
  return tempPath;
}

function removeTempFile(filepath) {
  const fileFolder = path.dirname(filepath);
  fs.unlinkSync(filepath);
  fs.rmdirSync(fileFolder);
}

function testWebpack(filename, content, deps, expectedDeps) {
  const tempPath = getTempPath(filename, content);
  const result = parse(content, tempPath, deps, __dirname);
  removeTempFile(tempPath);
  Array.from(result).should.deepEqual(expectedDeps);
}

describe('webpack special parser', () => {
  it('should ignore when filename is not supported', () => {
    const result = parse('content', 'not-supported.txt', []);
    result.should.deepEqual([]);
  });

  it('should recognize unused dependencies in webpack configuration', () => {
    const config = JSON.stringify({ module: testCases[0].module });
    const content = `module.exports = ${config}`;
    const deps = testCases[0].deps.concat(['unused-loader']);
    testWebpack('webpack.config.js', content, deps, testCases[0].deps);
  });

  it('should handle require call to other modules', () => {
    const config = JSON.stringify({ module: testCases[0].module });
    const content = `module.exports = ${config}\nrequire('webpack')`;
    testWebpack('webpack.config.js', content, testCases[0].deps, testCases[0].deps);
  });

  testCases.forEach(testCase =>
    it(`should ${testCase.name} in configuration file`, () => {
      const config = JSON.stringify({ module: testCase.module });
      const content = `module.exports = ${config}`;
      testWebpack('webpack.config.js', content, testCase.deps, testCase.deps);
    }));
});
