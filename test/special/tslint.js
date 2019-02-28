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
    name: 'skip single built-in config',
    content: {
      extends: 'tslint:recommended',
    },
    expected: [],
  },
  {
    name: 'skip built-in configs',
    content: {
      extends: [
        'tslint:recommended',
        'tslint:latest',
        'tslint:foo',
      ],
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
    name: 'handle config of module',
    content: {
      extends: 'some-module',
    },
    expected: [
      'some-module',
    ],
  },
  {
    name: 'handle config of multiple modules',
    content: {
      extends: [
        'some-module',
        '@another/module',
      ],
    },
    expected: [
      'some-module',
      '@another/module',
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
