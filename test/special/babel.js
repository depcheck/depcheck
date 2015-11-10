/* global describe, it */

import 'should';
import parse from '../../src/special/babel';

const testCases = [
  {
    name: 'recognize the short-name plugin',
    deps: ['babel-plugin-syntax-jsx'],
    options: {
      plugins: ['syntax-jsx'],
    },
  },
  {
    name: 'recognize the long-name plugin',
    deps: ['babel-plugin-syntax-jsx'],
    options: {
      plugins: ['babel-plugin-syntax-jsx'],
    },
  },
  {
    name: 'recognize the short-name preset',
    deps: ['babel-preset-es2015'],
    options: {
      presets: ['es2015'],
    },
  },
  {
    name: 'recognize the long-name preset',
    deps: ['babel-preset-es2015'],
    options: {
      presets: ['babel-preset-es2015'],
    },
  },
  {
    name: 'recognize plugin specified with options',
    deps: ['babel-plugin-transform-async-to-module-method'],
    options: {
      plugins: [
        ['transform-async-to-module-method', {
          module: 'bluebird',
          method: 'coroutine',
        }],
      ],
    },
  },
];

function testBabel(filename, deps, content) {
  const result = parse(JSON.stringify(content), filename, deps);
  result.should.deepEqual(deps);
}

describe('babel special parser', () => {
  it('should ignore when filename is not supported', () => {
    const result = parse('content', 'not-supported.txt', ['deps']);
    result.should.deepEqual([]);
  });

  testCases.forEach(testCase =>
    it(`should ${testCase.name} in .babelrc file`, () =>
      testBabel('.babelrc', testCase.deps, testCase.options)));

  testCases.forEach(testCase =>
    it(`should ${testCase.name} inside .babelrc file env section`, () =>
      testBabel('.babelrc', testCase.deps, {
        env: {
          production: testCase.options,
        },
      })));

  testCases.forEach(testCase =>
    it(`should ${testCase.name} in package.json file`, () =>
      testBabel('package.json', testCase.deps, {
        name: 'my-package',
        version: '1.0.0',
        babel: testCase.options,
      })));

  testCases.forEach(testCase =>
    it(`should ${testCase.name} inside .babelrc file env section`, () =>
      testBabel('package.json', testCase.deps, {
        name: 'my-package',
        version: '1.0.0',
        babel: {
          env: {
            development: testCase.options,
          },
        },
      })));
});
