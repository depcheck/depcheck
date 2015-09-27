/* global describe, it, before, after */

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

  if (typeof options.ignoreBinPackage !== 'undefined') {
    argv.push('--ignore-bin-package=' + options.ignoreBinPackage);
  }

  if (options.ignoreMatches) {
    argv.push('--ignores=' + options.ignoreMatches.join(','));
  }

  if (options.ignoreDirs) {
    argv.push('--ignore-dirs=' + options.ignoreDirs.join(','));
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

  it('should output help message', () =>
    new Promise(resolve => {
      let help;

      cli(
        ['--help'],
        data => help = data,
        data => data.should.fail(), // should not go into error log
        exitCode => resolve({ help, exitCode })
      );
    }).then(({ help, exitCode }) => {
      const helpDocs = help.split('\n').map(line => line.trim()).filter(line => line);
      const options = ['--help', '--json', '--dev', '--ignores'];

      options.forEach(option =>
        helpDocs.some(doc => doc.startsWith(option)).should.be.true());

      exitCode.should.equal(0);
    }));

  it('should output error when folder is not a package', () =>
    new Promise(resolve => {
      let help;
      let error;

      cli(
        [__dirname],
        data => help = data,
        data => error = data,
        exitCode => resolve({ help, error, exitCode })
      );
    }).then(({ help, error, exitCode }) => {
      error.should.containEql(__dirname)
        .and.containEql('not contain')
        .and.containEql('package.json');

      help.should.startWith('Usage: ')
        .and.containEql('--help');

      exitCode.should.equal(-1);
    }));

  it('should output error when folder not exists', () =>
    new Promise(resolve => {
      let error;

      cli(
        ['./not/exist/folder'],
        data => data.should.fail(), // should not go into log output
        data => error = data,
        exitCode => resolve({ error, exitCode })
      );
    }).then(({ error, exitCode }) => {
      error.should.containEql('/not/exist/folder').and.containEql('not exist');
      exitCode.should.equal(-1);
    }));

  it('should output no unused dependencies when happen', () =>
    new Promise(resolve => {
      let log;

      cli(
        [path.resolve(__dirname, './fake_modules/good')],
        data => log = data,
        data => data.should.fail(), // should not go into error output
        exitCode => resolve({ log, exitCode })
      );
    }).then(({ log, exitCode }) => {
      log.should.equal('No unused dependencies');
      exitCode.should.equal(0);
    }));

  it('should output unused dependencies when happen', () =>
    new Promise(resolve => {
      let log = '';

      cli(
        [path.resolve(__dirname, './fake_modules/bad')],
        data => log = data,
        data => data.should.fail(), // should not go into error output
        exitCode => resolve({
          logs: log.split('\n'),
          exitCode,
        })
      );
    }).then(({ logs, exitCode }) => {
      logs.should.have.length(2);
      logs[0].should.equal('Unused Dependencies');
      logs[1].should.containEql('optimist');

      exitCode.should.equal(-1);
    }));

  it('should output unused devDependencies when happen', () =>
    new Promise(resolve => {
      let log = '';

      cli(
        [path.resolve(__dirname, './fake_modules/dev')],
        data => log = data,
        data => data.should.fail(), // should not go into error output
        exitCode => resolve({
          logs: log.split('\n'),
          exitCode,
        })
      );
    }).then(({ logs, exitCode }) => {
      logs.should.have.length(2);
      logs[0].should.equal('Unused devDependencies');
      logs[1].should.containEql('mocha');

      exitCode.should.equal(-1);
    }));

  describe('without specified directory', () => {
    const expectedCwd = '/not/exist';
    let originalCwd;

    before(() => {
      originalCwd = process.cwd;
      process.cwd = () => expectedCwd;
    });

    it('should default to the current directory', () =>
      new Promise(resolve => {
        let error;

        cli(
          [],
          data => data.should.fail(), // should not go into log output
          data => error = data,
          exitCode => resolve({ error, exitCode })
        );
      }).then(({ error, exitCode }) => {
        error.should.containEql('not exist');
        exitCode.should.equal(-1);
      }));

    after(() => process.cwd = originalCwd);
  });
});
