/* global describe, it */

import assert from 'should';
import depcheck from '../src/index';
import fs from 'fs';
import path from 'path';
import q from 'q';

function asyncTo(fn) {
  const args = Array.prototype.slice.call(arguments, 1);
  const defer = q.defer();

  function callback(error, data) {
    if (error) {
      defer.reject(error);
    } else {
      defer.resolve(data);
    }
  }

  return () => {
    fn.apply(null, args.concat(callback));
    return defer.promise;
  };
}

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

  it('should ignore bad javascript', function testBadJS(done) {
    const absolutePath = path.resolve('test/fake_modules/bad_js');

    depcheck(absolutePath, {  }, function checked(unused) {
      unused.dependencies.should.have.length(1);

      const invalidFiles = Object.keys(unused.invalidFiles);
      invalidFiles.should.have.length(1);
      invalidFiles[0].should.endWith('/test/fake_modules/bad_js/index.js');

      const error = unused.invalidFiles[invalidFiles[0]];
      error.should.be.instanceof(SyntaxError);

      done();
    });
  });

  it('should allow dynamic package metadata', function testDynamic(done) {
    const absolutePath = path.resolve('test/fake_modules/bad');

    depcheck(absolutePath, {
      'package': {
        'dependencies': {
          'optimist': '~0.6.0',
          'express': '^4.0.0',
        },
      },
    }, function checked(unused) {
      assert.equal(unused.dependencies.length, 2);
      done();
    });
  });

  it('should handle directory access error', function testNonReadable() {
    const absolutePath = path.resolve('test/fake_modules/bad');
    const unreadableDir = path.join(absolutePath, 'unreadable');

    return asyncTo(fs.mkdir, unreadableDir, '0000')()
      .then(asyncTo(depcheck, absolutePath, {}))
      .catch(function checked(unused) {
        unused.dependencies.should.have.length(1);

        const invalidDirs = Object.keys(unused.invalidDirs);
        invalidDirs.should.have.length(1);
        invalidDirs[0].should.endWith('/test/fake_modules/bad/unreadable');

        const error = unused.invalidDirs[invalidDirs[0]];
        error.should.be.instanceof(Error);
        error.toString().should.containEql('EACCES');
      })
      .finally(asyncTo(fs.chmod, unreadableDir, '0700'))
      .finally(asyncTo(fs.rmdir, unreadableDir));
  });
});
