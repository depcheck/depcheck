/* global describe, it, before, after */

import 'should';
import fs from 'fs';
import path from 'path';
import cli from '../src/cli';

function makeArgv(module, options) {
  const testPath = path.resolve('test/fake_modules', module);
  const argv = [testPath];

  if (options.json) {
    argv.push('--json');
  }

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

  if (options.argv && options.argv.length) {
    argv.push(...options.argv);
  }

  return argv;
}

function testCli(argv) {
  let log = '';
  let error = '';

  return new Promise(resolve =>
    cli(
      argv,
      data => log = data,
      data => error = data,
      exitCode => resolve({
        log,
        error,
        exitCode,
        logs: log.split('\n').filter(line => line),
        errors: error.split('\n').filter(line => line),
      })));
}

describe('depcheck command line', () => {
  const spec = fs.readFileSync(__dirname + '/spec.json', { encoding: 'utf8' });
  const testCases = JSON.parse(spec);

  testCases.forEach(testCase => {
    const run = testCase.only === 'cli' ? it.only : it;
    const options = Object.assign({ json: true }, testCase.options);
    run('should ' + testCase.name, () =>
      testCli(makeArgv(testCase.module, options))
      .then(({ log, error, exitCode }) => {
        const actual = JSON.parse(log);
        const expected = testCase.expected;

        actual.dependencies.should.eql(expected.dependencies);
        actual.devDependencies.should.eql(expected.devDependencies);

        error.should.be.empty();
        exitCode.should.equal(0); // JSON output always return 0
      }));
  });

  it('should output help message', () =>
    testCli(['--help'])
    .then(({ log, error, exitCode }) => {
      const help = log.split('\n').map(line => line.trim()).filter(line => line);
      const options = ['--help', '--json', '--dev', '--ignores'];

      options.forEach(option =>
        help.some(doc => doc.startsWith(option)).should.be.true());

      error.should.be.empty();
      exitCode.should.equal(0);
    }));

  it('should output error when folder is not a package', () =>
    testCli([__dirname])
    .then(({ log, error, exitCode }) => {
      error.should.containEql(__dirname)
        .and.containEql('not contain')
        .and.containEql('package.json');

      log.should.startWith('Usage: ')
        .and.containEql('--help');

      exitCode.should.equal(-1);
    }));

  it('should output error when folder not exists', () =>
    testCli(['./not/exist/folder'])
    .then(({ log, error, exitCode }) => {
      error.should.containEql('/not/exist/folder').and.containEql('not exist');
      log.should.be.empty();
      exitCode.should.equal(-1);
    }));

  it('should output no unused dependencies when happen', () =>
    testCli([path.resolve(__dirname, './fake_modules/good')])
    .then(({ log, error, exitCode }) => {
      log.should.equal('No unused dependencies');
      error.should.be.empty();
      exitCode.should.equal(0);
    }));

  it('should output unused dependencies when happen', () =>
    testCli(makeArgv('bad', {}))
    .then(({ logs, error, exitCode }) => {
      logs.should.have.length(2);
      logs[0].should.equal('Unused Dependencies');
      logs[1].should.containEql('optimist');

      error.should.be.empty();
      exitCode.should.equal(-1);
    }));

  it('should output unused devDependencies when happen', () =>
    testCli(makeArgv('dev', {}))
    .then(({ logs, error, exitCode }) => {
      logs.should.have.length(2);
      logs[0].should.equal('Unused devDependencies');
      logs[1].should.containEql('mocha');

      error.should.be.empty();
      exitCode.should.equal(-1);
    }));

  it('should recognize JSX file even only pass jsx parser and require detector', () =>
    testCli(makeArgv('jsx', {
      argv: ['--parsers="*.jsx:jsx"', '--dectors=requireCallExpression'],
    }))
    .then(({ logs, error, exitCode }) => {
      logs.should.have.length(2);
      logs[0].should.equal('Unused Dependencies');
      logs[1].should.containEql('react');

      error.should.be.empty();
      exitCode.should.equal(-1);
    }));

  it('should not recognize JSX file when not pass jsx parser', () =>
    testCli(makeArgv('jsx', {
      argv: ['--parsers="*.jsx:es6"'],
    }))
    .then(({ logs, error, exitCode }) => {
      logs.should.have.length(2);
      logs[0].should.equal('Unused Dependencies');
      logs[1].should.containEql('react');

      error.should.be.empty();
      exitCode.should.equal(-1);
    }));

  it('should not recognize JSX file when not enable require detector', () =>
    testCli(makeArgv('jsx', {
      argv: ['--detectors=importDeclaration'],
    }))
    .then(({ logs, error, exitCode }) => {
      logs.should.have.length(2);
      logs[0].should.equal('Unused Dependencies');
      logs[1].should.containEql('react');

      error.should.be.empty();
      exitCode.should.equal(-1);
    }));

  it('should find dependencies with special parser', () =>
    testCli(makeArgv('eslint_airbnb', {
      argv: ['--specials=eslint'],
    }))
    .then(({ logs, error, exitCode }) => {
      logs.should.have.length(2);
      logs[0].should.equal('Unused Dependencies');
      logs[1].should.containEql('eslint-airbnb-testing');

      error.should.be.empty();
      exitCode.should.equal(-1);
    }));

  describe('without specified directory', () => {
    let originalCwd;

    before(() => {
      originalCwd = process.cwd;
      process.cwd = () => '/not/exist';
    });

    it('should default to the current directory', () =>
      testCli([])
      .then(({ log, error, exitCode }) => {
        error.should.containEql('not exist');
        log.should.be.empty();
        exitCode.should.equal(-1);
      }));

    after(() => process.cwd = originalCwd);
  });
});
