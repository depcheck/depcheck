/* global describe, it */

import 'should';
import parse from '../../src/special/bin';

const testCases = [
  {
    name: 'detect packages used in scripts',
    script: 'binary-entry --argument',
    dependencies: ['binary-package'],
    expected: ['binary-package'],
  },
  {
    name: 'detect packages used as `.bin` path',
    script: './node_modules/.bin/binary-entry',
    dependencies: ['binary-package'],
    expected: ['binary-package'],
  },
  {
    name: 'detect packages used as package path',
    script: './node_modules/binary-package/bin/binary-exe',
    dependencies: ['binary-package'],
    expected: ['binary-package'],
  },
  {
    name: 'detect packages combined with `npm bin` command',
    script: '$(npm bin)/binary-entry',
    dependencies: ['binary-package'],
    expected: ['binary-package'],
  },
  {
    name: 'not report it when it is not used',
    script: 'other-binary-entry',
    dependencies: ['binary-package'],
    expected: [],
  },
  {
    name: 'ignore detection when no scripts section',
    script: false,
    dependencies: ['binary-package'],
    expected: [],
  },
  {
    name: 'ignore the dependencies without bin entry',
    script: 'binary-entry',
    dependencies: ['eslint-config-standard'],
    expected: [],
  },
];

function testParser(testCase, content, filename) {
  const result = parse(content, filename, testCase.dependencies, __dirname);
  result.should.deepEqual(testCase.expected);
}

describe('bin special parser', () => {
  it('should ignore when filename is not supported', () => {
    const result = parse('content', 'not-supported.txt', [], '/root/dir');
    result.should.deepEqual([]);
  });

  describe('on `package.json`', () =>
    testCases.forEach(testCase =>
      it(`should ${testCase.name}`, () => {
        const content = testCase.script
          ? JSON.stringify({ scripts: { t: testCase.script } })
          : '{}';

        testParser(testCase, content, '/path/to/package.json');
      })));

  describe('on `.travis.yml`', () =>
    testCases.forEach(testCase =>
      it(`should ${testCase.name}`, () => {
        const content = testCase.script
          ? `script:\n  - ${testCase.script}`
          : '';

        testParser(testCase, content, '/path/to/.travis.yml');
      })));
});
