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
    name: 'ignore when `airbnb` is not used `.eslintrc`',
    content: {
      extends: 'others',
    },
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
    name: 'handle the `airbnb/legacy` config',
    content: {
      extends: 'airbnb/legacy',
    },
    expected: [
      'eslint-config-airbnb',
    ],
  },
  {
    name: 'detect `airbnb` even multiple configs are used',
    content: {
      extends: ['airbnb', 'others'],
    },
    expected: [
      'eslint-config-airbnb',
      'eslint-plugin-react',
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

describe('eslint special parser', () => {
  it('should ignore when filename is not `.eslintrc`', () => {
    const result = eslintSpecialParser('content', '/a/file');
    result.should.deepEqual([]);
  });

  it(`should handle parse error`, () => {
    const content = '{ this is an invalid JSON string';
    const result = eslintSpecialParser(content, '/path/to/.eslintrc');
    result.should.deepEqual([]);
  });

  describe('with JSON format', () =>
    testCases.forEach(testCase =>
      it(`should ${testCase.name}`, () => {
        const content = JSON.stringify(testCase.content);
        const result = eslintSpecialParser(content, '/path/to/.eslintrc');
        result.should.deepEqual(testCase.expected);
      })));

  describe('with YAML format', () =>
    testCases.forEach(testCase =>
      it(`should ${testCase.name}`, () => {
        const content = yaml.safeDump(testCase.content);
        const result = eslintSpecialParser(content, '/path/to/.eslintrc');
        result.should.deepEqual(testCase.expected);
      })));
});
