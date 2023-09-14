import 'should';
import fs from 'fs';
import path from 'path';
import { platform } from 'os';

import testCases from './spec';
import depcheck from '../src/index';
import { resolveShortPath } from './utils';

import {
  full as importListParser,
  lite as importListParserLite,
} from './fake_parsers/importList';

import exceptionParser from './fake_parsers/exception';
import { multipleParserA, multipleParserB } from './fake_parsers/multiple';

import exceptionDetector from './fake_detectors/exception';
import dependDetector from './fake_detectors/dependCallExpression';

function check(module, options) {
  return new Promise((resolve) =>
    depcheck(path.resolve(__dirname, 'fake_modules', module), options, resolve),
  );
}

describe('depcheck', () => {
  testCases.forEach((testCase) => {
    const run = testCase.only === 'index' ? it.only : it;
    run(`should ${testCase.name}`, () =>
      check(testCase.module, testCase.options).then((result) => {
        const { expected } = testCase;
        result.dependencies.should.eql(expected.dependencies);
        result.devDependencies.should.eql(expected.devDependencies);
        result.missing.should.eql(
          resolveShortPath(expected.missing, testCase.module),
        );

        result.using.should.eql(
          resolveShortPath(expected.using, testCase.module),
        );
      }),
    );
  });

  it('should ignore bad javascript', () =>
    check('bad_js', {}).then((unused) => {
      unused.dependencies.should.deepEqual(['optimist']);

      const invalidFiles = Object.keys(unused.invalidFiles);
      invalidFiles.should.have.length(1);
      invalidFiles[0].should.endWith(
        path.join('/test/fake_modules/bad_js/index.js'),
      );

      const error = unused.invalidFiles[invalidFiles[0]];
      error.should.be.instanceof(SyntaxError);
    }));

  it('should allow dynamic package metadata', () =>
    check('bad', {
      package: {
        dependencies: {
          optimist: '~0.6.0',
          express: '^4.0.0',
        },
      },
    }).then((unused) => {
      unused.dependencies.should.deepEqual(['optimist', 'express']);
    }));

  function testAccessUnreadableDirectory(
    module,
    unreadable,
    unusedDeps,
    unusedDevDeps,
  ) {
    if (platform() === 'win32') {
      return; // cannot test permission cases in Windows
    }

    const unreadablePath = path.resolve(
      __dirname,
      'fake_modules',
      module,
      unreadable,
    );

    before((done) => fs.mkdir(unreadablePath, '0000', done));

    it('should capture error', () =>
      check(module, {}).then((unused) => {
        unused.dependencies.should.deepEqual(unusedDeps);
        unused.devDependencies.should.deepEqual(unusedDevDeps);

        const invalidDirs = Object.keys(unused.invalidDirs);
        invalidDirs.should.deepEqual([unreadablePath]);

        const error = unused.invalidDirs[invalidDirs[0]];
        error.should.be.instanceof(Error);
        error.toString().should.containEql('EACCES');
      }));

    after((done) =>
      fs.chmod(unreadablePath, '0700', (error) =>
        error ? done(error) : fs.rmdir(unreadablePath, done),
      ),
    );
  }

  describe('access unreadable directory', () =>
    testAccessUnreadableDirectory(
      'unreadable',
      'unreadable',
      ['unreadable'],
      [],
    ));

  describe('access deep unreadable directory', () =>
    testAccessUnreadableDirectory(
      'unreadable_deep',
      'deep/nested/unreadable',
      [],
      [],
    ));

  function testAccessUnreadableFile(
    module,
    unreadable,
    unusedDeps,
    unusedDevDeps,
  ) {
    if (platform() === 'win32') {
      return; // cannot test permission cases in Windows
    }

    const unreadablePath = path.resolve(
      __dirname,
      'fake_modules',
      module,
      unreadable,
    );

    before((done) => fs.writeFile(unreadablePath, '', { mode: 0 }, done));

    it('should capture error', () =>
      check(module, {}).then((unused) => {
        unused.dependencies.should.deepEqual(unusedDeps);
        unused.devDependencies.should.deepEqual(unusedDevDeps);

        const invalidFiles = Object.keys(unused.invalidFiles);
        invalidFiles.should.deepEqual([unreadablePath]);

        const error = unused.invalidFiles[invalidFiles[0]];
        error.should.be.instanceof(Error);
        error.toString().should.containEql('EACCES');
      }));

    after((done) =>
      fs.chmod(unreadablePath, '0700', (error) =>
        error ? done(error) : fs.unlink(unreadablePath, done),
      ),
    );
  }

  describe('access unreadable file', () =>
    testAccessUnreadableFile(
      'unreadable',
      'unreadable.js',
      ['unreadable'],
      [],
    ));

  function testCustomPluggableComponents(module, options) {
    return check(module, options).then((unused) => {
      unused.dependencies.should.deepEqual([]);
      unused.devDependencies.should.deepEqual([]);

      Object.keys(unused.invalidFiles).should.have.length(0);
      Object.keys(unused.invalidDirs).should.have.length(0);
    });
  }

  it('should work fine even a customer parser throws exceptions', () =>
    testCustomPluggableComponents('good', {
      detectors: [depcheck.detector.requireCallExpression, exceptionDetector],
    }));

  it('should use custom parsers to generate AST', () =>
    testCustomPluggableComponents('import_list', {
      parsers: {
        '**/*.txt': importListParser,
      },
    }));

  it('should handle the returned string array as dependent packages', () =>
    testCustomPluggableComponents('import_list', {
      parsers: {
        '**/*.txt': importListParserLite,
      },
      detectors: [
        // the detector step is skipped because parser returns string array
      ],
    }));

  it('should discover peer dependencies for the parser returning string array case', () =>
    testCustomPluggableComponents('import_list_peer', {
      parsers: {
        '**/*.txt': importListParserLite,
      },
      detectors: [
        // the detector step is skipped because parser returns string array
      ],
    }));

  it('should support multiple parsers to generate ASTs', () =>
    testCustomPluggableComponents('multiple_parsers', {
      parsers: {
        '**/*.csv': [multipleParserA, multipleParserB],
      },
    }));

  it('should generate ASTs when multiple globs match filename', () =>
    testCustomPluggableComponents('multiple_parsers', {
      parsers: {
        '**/*.csv': multipleParserA,
        '**/index.*': multipleParserB,
      },
    }));

  it('should use custom detector to find dependencies', () =>
    testCustomPluggableComponents('depend', {
      detectors: [dependDetector],
    }));

  it('should handle other parsers even one throws exception', () =>
    check('import_list', {
      parsers: {
        '**/*.txt': [importListParser, exceptionParser],
      },
    }).then((unused) => {
      unused.dependencies.should.deepEqual([]);
      unused.devDependencies.should.deepEqual([]);

      Object.keys(unused.invalidDirs).should.have.length(0);

      Object.keys(unused.invalidFiles).should.have.length(1);
      Object.keys(unused.invalidFiles)[0].should.endWith(
        path.join('/test/fake_modules/import_list/index.txt'),
      );
    }));

  it('support parser patterns based on the file paths', () =>
    check('filepath_pattern', {
      parsers: {
        '**/src/*.js': depcheck.parser.jsx,
      },
    }).then((unused) => {
      unused.dependencies.should.deepEqual(['dont-find-me']);
      unused.devDependencies.should.deepEqual([]);
      unused.missing.should.deepEqual({});
      Object.keys(unused.using).should.deepEqual(['find-me', 'find-me2']);
    }));

  it('should resolve mapped imports from package.json imports', () =>
    check('package_import_map', {}).then((unused) => {
      unused.dependencies.should.deepEqual([
        'unused',
        'conditional-node-unused',
        'subpath-resolved-unused',
      ]);
      unused.devDependencies.should.deepEqual([]);
      unused.missing.should.deepEqual(
        resolveShortPath({ 'missing-dep': ['index.js'] }, 'package_import_map'),
      );
      Object.keys(unused.using).should.deepEqual([
        'simple-resolved',
        'subpath-resolved',
        'conditional-node',
        '@types/conditional',
        'conditional-node-test',
        'missing-dep',
        'wildcard-resolved',
      ]);
    }));
});
