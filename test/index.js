/* global describe, it, before, after */

import 'should';
import depcheck from '../src/index';
import fs from 'fs';
import path from 'path';

import importListParser from './fake_parsers/importList';
import exceptionDetector from './fake_detectors/exception';

describe('depcheck', () => {
  const spec = fs.readFileSync(__dirname + '/spec.json', { encoding: 'utf8' });
  const testCases = JSON.parse(spec);

  testCases.forEach(testCase => {
    it('should ' + testCase.name, done => {
      const testPath = path.resolve('test/fake_modules/' + testCase.module);
      const options = testCase.options;
      const expected = testCase.expected;

      depcheck(testPath, options, result => {
        result.dependencies.should.eql(expected.dependencies);
        result.devDependencies.should.eql(expected.devDependencies);
        done();
      });
    });
  });

  it('should ignore bad javascript', done => {
    const absolutePath = path.resolve('test/fake_modules/bad_js');

    depcheck(absolutePath, {}, unused => {
      unused.dependencies.should.deepEqual(['optimist']);

      const invalidFiles = Object.keys(unused.invalidFiles);
      invalidFiles.should.have.length(1);
      invalidFiles[0].should.endWith('/test/fake_modules/bad_js/index.js');

      const error = unused.invalidFiles[invalidFiles[0]];
      error.should.be.instanceof(SyntaxError);

      done();
    });
  });

  it('should allow dynamic package metadata', done => {
    const absolutePath = path.resolve('test/fake_modules/bad');

    depcheck(absolutePath, {
      'package': {
        'dependencies': {
          'optimist': '~0.6.0',
          'express': '^4.0.0',
        },
      },
    }, unused => {
      unused.dependencies.should.deepEqual(['optimist', 'express']);
      done();
    });
  });

  function testAccessUnreadableDirectory(
    module, unreadable, unusedDeps, unusedDevDeps) {
    const modulePath = path.resolve(__dirname, 'fake_modules', module);
    const unreadablePath = path.resolve(modulePath, unreadable);

    before(done => fs.mkdir(unreadablePath, '0000', done));

    it('should capture error', done =>
      depcheck(modulePath, {}, unused => {
        unused.dependencies.should.deepEqual(unusedDeps);
        unused.devDependencies.should.deepEqual(unusedDevDeps);

        const invalidDirs = Object.keys(unused.invalidDirs);
        invalidDirs.should.deepEqual([unreadablePath]);

        const error = unused.invalidDirs[invalidDirs[0]];
        error.should.be.instanceof(Error);
        error.toString().should.containEql('EACCES');

        done();
      }));

    after(done =>
      fs.chmod(unreadablePath, '0700', error =>
        error ? done(error) : fs.rmdir(unreadablePath, done)));
  }

  describe('access unreadable directory', () =>
    testAccessUnreadableDirectory(
      'unreadable',
      'unreadable',
      ['unreadable'],
      []));

  describe('access deep unreadable directory', () =>
    testAccessUnreadableDirectory(
      'unreadable_deep',
      'deep/nested/unreadable',
      [],
      []));

  function testAccessUnreadableFile(
    module, unreadable, unusedDeps, unusedDevDeps) {
    const modulePath = path.resolve(__dirname, 'fake_modules', module);
    const unreadablePath = path.resolve(modulePath, unreadable);

    before(done => fs.writeFile(unreadablePath, '', { mode: 0 }, done));

    it('should capture error', done =>
      depcheck(modulePath, {}, unused => {
        unused.dependencies.should.deepEqual(unusedDeps);
        unused.devDependencies.should.deepEqual(unusedDevDeps);

        const invalidFiles = Object.keys(unused.invalidFiles);
        invalidFiles.should.deepEqual([unreadablePath]);

        const error = unused.invalidFiles[invalidFiles[0]];
        error.should.be.instanceof(Error);
        error.toString().should.containEql('EACCES');

        done();
      }));

    after(done =>
      fs.chmod(unreadablePath, '0700', error =>
        error ? done(error) : fs.unlink(unreadablePath, done)));
  }

  describe('access unreadable file', () =>
    testAccessUnreadableFile(
      'unreadable',
      'unreadable.js',
      ['unreadable'],
      []));

  it('should work fine even a customer parser throws exceptions', done => {
    const absolutePath = path.resolve('test/fake_modules/good');

    depcheck(absolutePath, {
      detectors: [
        depcheck.detectors.requireCallExpression,
        exceptionDetector,
      ],
    }, unused => {
      unused.dependencies.should.deepEqual([]);
      unused.devDependencies.should.deepEqual([]);

      Object.keys(unused.invalidFiles).should.have.length(0);
      Object.keys(unused.invalidDirs).should.have.length(0);

      done();
    });
  });

  it('should use custom parsers to generate AST', done => {
    const absolutePath = path.resolve('test/fake_modules/import_list');

    depcheck(absolutePath, {
      parsers: {
        '.txt': importListParser,
      },
    }, unused => {
      unused.dependencies.should.deepEqual([]);
      unused.devDependencies.should.deepEqual([]);

      Object.keys(unused.invalidFiles).should.have.length(0);
      Object.keys(unused.invalidDirs).should.have.length(0);

      done();
    });
  });
});
