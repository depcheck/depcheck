/* global describe, it */

import 'should';
import yaml from 'js-yaml';
import eslintSpecialParser from '../../src/special/eslint';

const testCases = [
  {
    name: 'ignore when user not extends any config in `.eslintrc`',
    content: {},
    expected: [],
  },
  {
    name: 'handle the `standard` config',
    content: {
      extends: 'standard',
    },
    expected: [
      'eslint-config-standard',
      'eslint-plugin-standard',
    ],
  },
  {
    name: 'handle the `airbnb` config',
    content: {
      extends: 'airbnb',
    },
    expected: [
      'eslint-config-airbnb',
      'eslint-plugin-react',
    ],
  },
  {
    name: 'handle the `airbnb/base` config',
    content: {
      extends: 'airbnb/base',
    },
    expected: [
      'eslint-config-airbnb',
    ],
  },
  {
    name: 'detect specific parser',
    content: {
      parser: 'babel-eslint',
    },
    expected: [
      'babel-eslint',
    ],
  },
  {
    name: 'detect specific plugins',
    content: {
      plugins: ['mocha'],
    },
    expected: [
      'eslint-plugin-mocha',
    ],
  },
];

function testEslint(deps, content) {
  const result = eslintSpecialParser(
    content, '/path/to/.eslintrc', deps, __dirname);

  result.should.deepEqual(deps);
}

describe('eslint special parser', () => {
  it('should ignore when filename is not `.eslintrc`', () => {
    const result = eslintSpecialParser('content', '/a/file');
    result.should.deepEqual([]);
  });

  it(`should handle parse error`, () =>
    testEslint([], '{ this is an invalid JSON string'));

  describe('with JSON format', () =>
    testCases.forEach(testCase =>
      it(`should ${testCase.name}`, () =>
        testEslint(testCase.expected, JSON.stringify(testCase.content)))));

  describe('with YAML format', () =>
    testCases.forEach(testCase =>
      it(`should ${testCase.name}`, () =>
        testEslint(testCase.expected, yaml.safeDump(testCase.content)))));
});
