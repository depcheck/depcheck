var assert = require("should");
var depcheck = require("../index");
var path = require("path");

describe("depcheck", function () {
  it("should find unused dependencies", function testUnused(done) {
    var absolutePath = path.resolve("test/fake_modules/bad");

    depcheck(absolutePath, { "withoutDev": true }, function checked(unused) {
      assert.equal(unused.dependencies.length, 1);
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

  it("should should ignore ignoreDirs", function testUnused(done) {
    var absolutePath = path.resolve("test/fake_modules/bad");

    depcheck(absolutePath, { "ignoreDirs": ['sandbox'] }, function checked(unused) {
      assert.equal(unused.dependencies.length, 1);
      done();
    });
  });

  it("should should ignore ignoreMatches", function testUnused(done) {
    var absolutePath = path.resolve("test/fake_modules/bad");

    depcheck(absolutePath, { "ignoreMatches": ['o*'] }, function checked(unused) {
      assert.equal(unused.dependencies.length, 0);
      done();
    });
  });

  it("should should ignore bad javascript", function testBadJS(done) {
    var absolutePath = path.resolve("test/fake_modules/bad_js");

    depcheck(absolutePath, {  }, function checked(unused) {
      assert.equal(unused.dependencies.length, 1);
      //assert.deepEqual(Object.keys(unused.invalidFiles).length, 2);
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

});
