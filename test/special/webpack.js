/* global describe, it */

import 'should';
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

function testWebpack(filename, deps, module) {
  const config = JSON.stringify({ module });
  const result = parse(`module.exports = ${config}`, filename, deps);
  Array.from(result).should.deepEqual(deps); // result is from vm, needs to wrap
}

describe('webpack special parser', () => {
  it('should ignore when filename is not supported', () => {
    const result = parse('content', 'not-supported.txt', []);
    result.should.deepEqual([]);
  });

  it('should recognize unused dependencies in webpack configuration', () => {
    const module = testCases[0].module;
    const config = JSON.stringify({ module });
    const result = parse(
      `module.exports = ${config}`,
      '/path/to/webpack.config.js',
      testCases[0].deps.concat(['unused-loader']));

    Array.from(result).should.deepEqual(testCases[0].deps);
  });

  testCases.forEach(testCase =>
    it(`should ${testCase.name} in configuration file`, () =>
      testWebpack('webpack.config.js', testCase.deps, testCase.module)));
});
