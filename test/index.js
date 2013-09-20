var assert = require("should");
var depcheck = require("../index");
var path = require("path");

describe('depcheck', function () {
  it('should find unused dependencies', function testUnused(done) {
    var absolutePath = path.resolve("test/fake_modules/bad");

    depcheck(absolutePath, function checked(unused) {
      assert.equal(unused.length, 1);
      done();
    });
  });

  it('should find all dependencies', function testUnused(done) {
    var absolutePath = path.resolve("test/fake_modules/good");

    depcheck(absolutePath, function checked(unused) {
      assert.equal(unused.length, 0);
      done();
    });
  });

  it('should find manage grunt dependencies', function testUnused(done) {
    var absolutePath = path.resolve("test/fake_modules/grunt");

    depcheck(absolutePath, function checked(unused) {
      assert.equal(unused.length, 0);
      done();
    });
  });   

  it('should find manage grunt task dependencies', function testUnused(done) {
    var absolutePath = path.resolve("test/fake_modules/grunt-tasks");

    depcheck(absolutePath, function checked(unused) {
      assert.equal(unused.length, 0);
      done();
    });
  });  
});
