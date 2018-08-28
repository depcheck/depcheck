/* global describe, it */

import 'should';
import yaml from 'js-yaml';
import tslintSpecialParser from '../../src/special/tslint';

const testCases = [
  {
    name: 'ignore when user not extends any config in `.tslintrc`',
    content: {},
    expected: [],
  },
  {
    name: 'detect specific plugins',
    content: {
      plugins: ['mocha'],
    },
    expected: [
      'tslint-plugin-mocha',
    ],
  },
  {
    name: 'handle tslint config with short name',
    content: {
      extends: 'preset',
    },
    expected: [
      'tslint-config-preset',
    ],
  },
  {
    name: 'handle tslint config with full name',
    content: {
      extends: 'tslint-config-preset',
    },
    expected: [
      'tslint-config-preset',
    ],
  },
  {
    name: 'skip tslint recommended config',
    content: {
      extends: 'tslint:recommended',
    },
    expected: [],
  },
  {
    name: 'handle config of absolute local path',
    content: {
      extends: '/path/to/config',
    },
    expected: [],
  },
  {
    name: 'handle config of relative local path',
    content: {
      extends: './config',
    },
    expected: [],
  },
  {
    name: 'handle config of scoped module',
    content: {
      extends: '@my-org/short-customized',
    },
    expected: [
      '@my-org/tslint-config-short-customized',
    ],
  },
  {
    name: 'handle config of scoped module with full name',
    content: {
      extends: '@my-org/tslint-config-long-customized',
    },
    expected: [
      '@my-org/tslint-config-long-customized',
    ],
  },
  {
    name: 'handle config from plugin with short name',
    content: {
      extends: 'plugin:node/recommended',
    },
    expected: [
      'tslint-plugin-node',
    ],
  },
  {
    name: 'handle config from plugin with full name',
    content: {
      extends: 'plugin:tslint-plugin-node/recommended',
    },
    expected: [
      'tslint-plugin-node',
    ],
  },
  {
    name: 'handle config from scoped plugin with short name',
    content: {
      extends: 'plugin:@my-org/short-customized/recommended',
    },
    expected: [
      '@my-org/tslint-plugin-short-customized',
    ],
  },
  {
    name: 'handle config from scoped plugin with full name',
    content: {
      extends: 'plugin:@my-org/tslint-plugin-long-customized/recommended',
    },
    expected: [
      '@my-org/tslint-plugin-long-customized',
    ],
  },
];

function testTslint(deps, content) {
  [
    '/path/to/.tslintrc',
    '/path/to/.tslintrc.js',
    '/path/to/.tslintrc.json',
    '/path/to/.tslintrc.yml',
    '/path/to/.tslintrc.yaml',
  ].forEach((pathToTslintrc) => {
    const result = tslintSpecialParser(
      content, pathToTslintrc, deps, __dirname,
    );

    result.should.deepEqual(deps);
  });
}

describe('tslint special parser', () => {
  it('should ignore when filename is not `.tslintrc`', () => {
    const result = tslintSpecialParser('content', '/a/file');
    result.should.deepEqual([]);
  });

  it('should handle parse error', () =>
    testTslint([], '{ this is an invalid JSON string'));

  it('should handle non-standard JSON content', () =>
    testTslint(
      testCases[1].expected,
      `${JSON.stringify(testCases[1].content)}\n// this is ignored`,
    ));

  describe('with JSON format', () =>
    testCases.forEach(testCase =>
      it(`should ${testCase.name}`, () =>
        testTslint(testCase.expected, JSON.stringify(testCase.content)))));

  describe('with YAML format', () =>
    testCases.forEach(testCase =>
      it(`should ${testCase.name}`, () =>
        testTslint(testCase.expected, yaml.safeDump(testCase.content)))));
});
