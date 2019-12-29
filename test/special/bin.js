import 'should';
import parse from '../../src/special/bin';

const testCases = [
  {
    name: 'detect packages used in scripts in local directory',
    script: 'binary-entry --argument',
    dependencies: ['binary-package'],
    expected: ['binary-package'],
  },
  {
    name: 'detect packages used in scripts in parent directory',
    script: 'binupper --upperarg',
    dependencies: ['upperbin'],
    expected: ['upperbin'],
  },
  {
    name: 'detect packages used in scripts (anywhere)',
    script: 'binary-entry --argument || binupper --upperarg',
    dependencies: ['binary-package', 'upperbin'],
    expected: ['binary-package', 'upperbin'],
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
    name: 'detect package bin without prefix dot',
    script: 'node_modules/.bin/binary-entry',
    dependencies: ['binary-package'],
    expected: ['binary-package'],
  },
  {
    name: 'detect package path without prefix dot',
    script: 'node_modules/binary-package/bin/binary-exe',
    dependencies: ['binary-package'],
    expected: ['binary-package'],
  },
  {
    name: 'detect binary call with variable set',
    script: 'NODE_ENV=production binary-entry',
    dependencies: ['binary-package'],
    expected: ['binary-package'],
  },
  {
    name: 'not report it when it is not used',
    script: 'other-binary-entry',
    dependencies: ['binary-package', 'upperbin'],
    expected: [],
  },
  {
    name: 'ignore detection when no scripts section',
    script: false,
    dependencies: ['binary-package', 'upperbin'],
    expected: [],
  },
  {
    name: 'ignore dependency without bin entry',
    script: 'binary-entry',
    dependencies: ['binary-no-bin'],
    expected: [],
  },
  {
    name: 'handle dependency without package.json',
    script: 'binary-entry',
    dependencies: ['binary-no-package'],
    expected: [],
  },
  {
    name: 'detect packages used with --require and /register',
    script: 'module --require binary-entry/register',
    dependencies: ['binary-package'],
    expected: ['binary-package'],
  },
  {
    name: 'detect packages used with --require',
    script: 'module --require binary-entry',
    dependencies: ['binary-package'],
    expected: ['binary-package'],
  },
  {
    name: 'detect packages with single binary',
    script: 'single-binary-package --argument',
    dependencies: ['single-binary-package'],
    expected: ['single-binary-package'],
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
    testCases.forEach((testCase) =>
      it(`should ${testCase.name}`, () => {
        const content = testCase.script
          ? JSON.stringify({ scripts: { t: testCase.script } })
          : '{}';

        testParser(testCase, content, `/path/to/${testCase.name}/package.json`);
      }),
    ));

  describe('on `.travis.yml`', () =>
    testCases.forEach((testCase) =>
      it(`should ${testCase.name}`, () => {
        const content = testCase.script
          ? `script:\n  - ${testCase.script}`
          : '';

        testParser(testCase, content, `/path/to/${testCase.name}/.travis.yml`);
      }),
    ));

  it('should check lifecycle commands in `.travis.yml` file', () => {
    const content = `before_deploy:\n  - ${testCases[0].script}`;
    testParser(testCases[0], content, '/path/to/.travis.yml');
  });
});
