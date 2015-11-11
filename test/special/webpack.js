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
