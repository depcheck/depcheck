/* global describe, it */

import 'should';
import fs from 'fs';
import path from 'path';
import cli from '../src/cli';

function makeArgv(testCase) {
  const options = testCase.options;
  const testPath = path.resolve('test/fake_modules/' + testCase.module);
  const argv = [testPath, '--json'];

  if (options.withoutDev) {
    argv.push('--dev=false');
  }

  return argv;
}

describe('depcheck command line', () => {
  const spec = fs.readFileSync(__dirname + '/spec.json', { encoding: 'utf8' });
  const testCases = JSON.parse(spec);

  testCases.forEach(testCase => {
    it('should ' + testCase.name, () =>
      new Promise(resolve => {
        let log;

        cli(
          makeArgv(testCase),
          data => log = data,
          data => data.should.fail(), // should not go into error log
          exitCode => resolve({ log, exitCode })
        );
      }).then(({ log, exitCode }) => {
        const actual = JSON.parse(log);
        const expected = testCase.expected;

        actual.dependencies.should.eql(expected.dependencies);
        actual.devDependencies.should.eql(expected.devDependencies);

        exitCode.should.equal(0); // JSON output always return 0
      }));
  });
});
