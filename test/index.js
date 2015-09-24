/* global describe, it */

var assert = require("should");
var depcheck = require("../index");
var fs = require("fs");
var path = require("path");
var q = require('q');

function asyncTo(fn) {
  var args = Array.prototype.slice.call(arguments, 1);
  var defer = q.defer();

  function callback(error, data) {
    if (error) {
      defer.reject(error);
    } else {
      defer.resolve(data);
    }
  }

  return function () {
    fn.apply(null, args.concat(callback));
    return defer.promise;
  }
}

describe("depcheck", function () {
  it("should find unused dependencies", function testUnused(done) {
    var absolutePath = path.resolve("test/fake_modules/bad");

    depcheck(absolutePath, { "withoutDev": true }, function checked(unused) {
      assert.equal(unused.dependencies.length, 1);
      done();
    });
  });

  it("should find unused dependencies in ES6 files", function testUnused(done) {
    var absolutePath = path.resolve("test/fake_modules/bad_es6");

    depcheck(absolutePath, { "withoutDev": true }, function checked(unused) {
      assert.equal(unused.dependencies.length, 1);
      assert.equal(unused.dependencies[0], "dont-find-me");
      done();
    });
  });

  it("should find all dependencies", function testUnused(done) {
    var absolutePath = path.resolve("test/fake_modules/good");

    depcheck(absolutePath, { "withoutDev": true }, function checked(unused) {
      assert.equal(unused.dependencies.length, 0);
      done();
    });
  });

  it("should find all dependencies in ES6 files", function testUnused(done) {
    var absolutePath = path.resolve("test/fake_modules/good_es6");

    depcheck(absolutePath, { "withoutDev": true }, function checked(unused) {
      // See ./good_es6/index.js for more information on the unsupported ES6
      // import syntax, which we assert here as the expected missing import.
      assert.equal(unused.dependencies.length, 1);
      assert.equal(unused.dependencies[0], "unsupported-syntax");
      done();
    });
  });

  it("should find manage grunt dependencies", function testUnused(done) {
    var absolutePath = path.resolve("test/fake_modules/grunt");

    depcheck(absolutePath, { "withoutDev": true }, function checked(unused) {
      assert.equal(unused.dependencies.length, 0);
      done();
    });
  });

  it("should find manage grunt task dependencies", function testUnused(done) {
    var absolutePath = path.resolve("test/fake_modules/grunt-tasks");

    depcheck(absolutePath, { "withoutDev": true }, function checked(unused) {
      assert.equal(unused.dependencies.length, 0);
      done();
    });
  });

  it("should look at devDependencies", function testUnused(done) {
    var absolutePath = path.resolve("test/fake_modules/dev");

    depcheck(absolutePath, { "withoutDev": false }, function checked(unused) {
      assert.equal(unused.devDependencies.length, 1);
      done();
    });
  });

  it("should ignore ignoreDirs", function testUnused(done) {
    var absolutePath = path.resolve("test/fake_modules/bad_deep");

    depcheck(absolutePath, { "ignoreDirs": ['sandbox'] }, function checked(unused) {
      assert.equal(unused.dependencies.length, 1);
      assert.equal(unused.dependencies[0], 'module_bad_deep');
      done();
    });
  });

  it("should ignore ignoreMatches", function testUnused(done) {
    var absolutePath = path.resolve("test/fake_modules/bad");

    depcheck(absolutePath, { "ignoreMatches": ['o*'] }, function checked(unused) {
      assert.equal(unused.dependencies.length, 0);
      done();
    });
  });

  it("should ignore bad javascript", function testBadJS(done) {
    var absolutePath = path.resolve("test/fake_modules/bad_js");

    depcheck(absolutePath, {  }, function checked(unused) {
      unused.dependencies.should.have.length(1);

      var invalidFiles = Object.keys(unused.invalidFiles);
      invalidFiles.should.have.length(1);
      invalidFiles[0].should.endWith('/test/fake_modules/bad_js/index.js');

      var error = unused.invalidFiles[invalidFiles[0]];
      error.should.be.instanceof(SyntaxError);

      done();
    });
  });

  it("should recognize nested requires", function testNested(done) {
    var absolutePath = path.resolve("test/fake_modules/nested");

    depcheck(absolutePath, {  }, function checked(unused) {
      assert.equal(unused.dependencies.length, 0);
      done();
    });
  });

  it("should support module names that are numbers", function testNested(done) {
    var absolutePath = path.resolve("test/fake_modules/number");

    depcheck(absolutePath, {  }, function checked(unused) {
      assert.equal(unused.dependencies.length, 0);
      done();
    });
  });

  it("should handle empty JavaScript file", function testEmpty(done) {
    var absolutePath = path.resolve("test/fake_modules/empty_file");

    depcheck(absolutePath, {}, function checked(unused) {
      assert.equal(unused.dependencies.length, 1);
      done();
    });
  });

  it("should allow dynamic package metadata", function testDynamic(done) {
    var absolutePath = path.resolve("test/fake_modules/bad");

    depcheck(absolutePath, {
      "package": {
        "dependencies": {
          "optimist": "~0.6.0",
          "express": "^4.0.0"
        }
      }
    }, function checked(unused) {
      assert.equal(unused.dependencies.length, 2);
      done();
    });
  });

  it("should exclude bin dependencies", function testBin(done) {
    var absolutePath = path.resolve("test/fake_modules/bin_js");

    depcheck(absolutePath, {  }, function checked(unused) {
      assert.equal(unused.dependencies.length, 0);
      done();
    });
  });

  it('should handle directory access error', function testNonReadable() {
    var absolutePath = path.resolve("test/fake_modules/bad");
    var unreadableDir = path.join(absolutePath, 'unreadable');

    return asyncTo(fs.mkdir, unreadableDir, '0000')()
      .then(asyncTo(depcheck, absolutePath, {}))
      .catch(function checked(unused) {
        unused.dependencies.should.have.length(1);

        var invalidDirs = Object.keys(unused.invalidDirs);
        invalidDirs.should.have.length(1);
        invalidDirs[0].should.endWith('/test/fake_modules/bad/unreadable');

        var error = unused.invalidDirs[invalidDirs[0]];
        error.should.be.instanceof(Error);
        error.toString().should.containEql('EACCES');
      })
      .finally(asyncTo(fs.chmod, unreadableDir, '0700'))
      .finally(asyncTo(fs.rmdir, unreadableDir));
  });

  it("should work without dependencies", function testNoDependencies(done) {
    var absolutePath = path.resolve("test/fake_modules/empty_dep");

    depcheck(absolutePath, {  }, function checked(unused) {
      assert.equal(unused.dependencies.length, 0);
      done();
    });
  });

  it('should handle require function with parameterless', function testRequireNothing(done) {
    var absolutePath = path.resolve("test/fake_modules/require_nothing");

    depcheck(absolutePath, {  }, function checked(unused) {
      assert.equal(unused.dependencies.length, 1);
      assert.equal(unused.dependencies[0], 'require-nothing');
      done();
    });
  });
});
