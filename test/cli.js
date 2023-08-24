import 'should';
import path from 'path';
import cli from '../src/cli';
import testCases from './spec';
import { resolveShortPath } from './utils';

function makeArgv(module, options) {
  const testPath = path.resolve('test/fake_modules', module);
  const argv = [testPath];

  if (options.config) {
    argv.push(`--config=${options.config}`);
  }

  if (options.json) {
    argv.push('--json');
  }

  if (options.quiet) {
    argv.push('--quiet');
  }

  if (typeof options.ignoreBinPackage !== 'undefined') {
    argv.push(`--ignore-bin-package=${options.ignoreBinPackage}`);
  }

  if (options.ignoreMatches) {
    argv.push(`--ignores=${options.ignoreMatches.join(',')}`);
  }

  if (options.ignoreDirs) {
    argv.push(`--ignore-dirs=${options.ignoreDirs.join(',')}`);
  }

  if (options.detectors) {
    argv.push(`--detectors=${options.detectors.map((f) => f.name).join(',')}`);
  }

  if (options.argv && options.argv.length) {
    argv.push(...options.argv);
  }

  if (options.skipMissing !== undefined) {
    argv.push(`--skip-missing=${options.skipMissing}`);
  }

  return argv;
}

function testCli(argv) {
  let log = '';
  let error = '';

  return new Promise((resolve) =>
    cli(
      argv,
      (data) => {
        log = data;
      },
      (data) => {
        error = data;
      },
      (exitCode) =>
        resolve({
          log,
          error,
          exitCode,
          logs: log.split('\n').filter((line) => line),
          errors: error.split('\n').filter((line) => line),
        }),
    ),
  );
}

describe('depcheck command line', () => {
  testCases.forEach((testCase) => {
    const run = testCase.only === 'cli' ? it.only : it;
    const options = { json: true, ...testCase.options };
    run(`should ${testCase.name}`, () =>
      testCli(makeArgv(testCase.module, options)).then(
        ({ log, error, exitCode }) => {
          const actual = JSON.parse(log);
          const { expected } = testCase;

          actual.dependencies.should.eql(expected.dependencies);
          actual.devDependencies.should.eql(expected.devDependencies);
          actual.missing.should.eql(
            resolveShortPath(expected.missing, testCase.module),
          );
          actual.using.should.eql(
            resolveShortPath(expected.using, testCase.module),
          );

          error.should.be.empty();
          exitCode.should.equal(testCase.expectedErrorCode);
        },
      ),
    );
  });

  it('should load config from cli argument', () =>
    testCli(
      makeArgv('config_argument', {
        config: path.resolve(
          'test/fake_modules',
          'config_argument',
          'subdir',
          'depcheckrc.json',
        ),
      }),
    ).then(({ log, error, exitCode }) => {
      log.should.equal('No depcheck issue');
      error.should.be.empty();
      exitCode.should.equal(0);
    }));

  it('should output error when folder is not a package', () =>
    testCli([__dirname]).then(({ log, error, exitCode }) => {
      error.should
        .containEql(__dirname)
        .and.containEql('not contain')
        .and.containEql('package.json');

      log.should.be.empty();
      exitCode.should.equal(-1);
    }));

  it('should output error when folder not exists', () =>
    testCli(['./not/exist/folder']).then(({ log, error, exitCode }) => {
      error.should.containEql('/not/exist/folder').and.containEql('not exist');
      log.should.be.empty();
      exitCode.should.equal(-1);
    }));

  it('should output call stack for invalid files in JSON view', () =>
    testCli(makeArgv('bad_js', { json: true })).then(
      ({ log, error, exitCode }) => {
        const json = JSON.parse(log);
        json.should.have.properties([
          'dependencies',
          'devDependencies',
          'invalidFiles',
          'invalidDirs',
        ]);

        const badJsPath = path.resolve(
          __dirname,
          './fake_modules/bad_js/index.js',
        );
        json.invalidFiles.should.have
          .property(badJsPath)
          .startWith('SyntaxError: Unexpected token')
          .and.containEql('\n    at '); // call stack information

        error.should.be.empty();
        exitCode.should.equal(-1);
      },
    ));

  it('should output no depcheck issue when happen', () =>
    testCli([path.resolve(__dirname, './fake_modules/good')]).then(
      ({ log, error, exitCode }) => {
        log.should.equal('No depcheck issue');
        error.should.be.empty();
        exitCode.should.equal(0);
      },
    ));

  it('should output no depcheck issue when happen', () =>
    testCli(makeArgv('good', { quiet: true })).then(
      ({ log, error, exitCode }) => {
        log.should.equal('');
        error.should.be.empty();
        exitCode.should.equal(0);
      },
    ));

  it('should output unused dependencies', () =>
    testCli(makeArgv('bad', {})).then(({ logs, error, exitCode }) => {
      logs.should.have.length(2);
      logs[0].should.equal('Unused dependencies');
      logs[1].should.containEql('optimist');

      error.should.be.empty();
      exitCode.should.equal(-1);
    }));

  it('should output unused devDependencies', () =>
    testCli(makeArgv('dev', {})).then(({ logs, error, exitCode }) => {
      logs.should.have.length(2);
      logs[0].should.equal('Unused devDependencies');
      logs[1].should.containEql('unused-dev-dep');

      error.should.be.empty();
      exitCode.should.equal(-1);
    }));

  it('should output missing dependencies', () =>
    testCli(makeArgv('missing', {})).then(({ logs, error, exitCode }) => {
      logs.should.have.length(2);
      logs[0].should.equal('Missing dependencies');
      logs[1].should.containEql('missing-dep');

      error.should.be.empty();
      exitCode.should.equal(-1);
    }));

  it('should recognize JSX file even only pass jsx parser and require detector', () =>
    testCli(
      makeArgv('jsx', {
        argv: ['--parsers="**/*.jsx:jsx"', '--dectors=requireCallExpression'],
      }),
    ).then(({ logs, error, exitCode }) => {
      logs.should.have.length(1);
      logs[0].should.equal('No depcheck issue');

      error.should.be.empty();
      exitCode.should.equal(0);
    }));

  it('should not recognize JSX file when not pass jsx parser', () =>
    testCli(
      makeArgv('jsx', {
        argv: ['--parsers="**/*.jsx:es6"'],
      }),
    ).then(({ logs, error, exitCode }) => {
      logs.should.have.length(2);
      logs[0].should.equal('Unused dependencies');
      logs[1].should.containEql('react');

      error.should.be.empty();
      exitCode.should.equal(-1);
    }));

  it('should not recognize JSX file when not enable require detector', () =>
    testCli(
      makeArgv('jsx', {
        argv: ['--detectors=importDeclaration'],
      }),
    ).then(({ logs, error, exitCode }) => {
      logs.should.have.length(2);
      logs[0].should.equal('Unused dependencies');
      logs[1].should.containEql('react');

      error.should.be.empty();
      exitCode.should.equal(-1);
    }));

  it('should find dependencies with special parser', () =>
    testCli(
      makeArgv('eslint_config', {
        argv: ['--specials=eslint'],
      }),
    ).then(({ logs, error, exitCode }) => {
      logs.should.have.length(2);
      logs[0].should.equal('Unused devDependencies');
      logs[1].should.containEql('eslint-config-unused');

      error.should.be.empty();
      exitCode.should.equal(-1);
    }));

  it('should find dependencies with special parser', () =>
    testCli(
      makeArgv('gatsby', {
        argv: ['--specials=gatsby'],
      }),
    ).then(({ logs, error, exitCode }) => {
      logs.should.have.length(3);
      logs[0].should.equal('Unused dependencies');
      logs[1].should.containEql('gatsby-plugin-react-helmet');

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
      testCli([]).then(({ log, error, exitCode }) => {
        error.should.containEql('not exist');
        log.should.be.empty();
        exitCode.should.equal(-1);
      }));

    after(() => {
      process.cwd = originalCwd;
    });
  });
});
