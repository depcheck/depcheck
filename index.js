var fs = require("fs");
var path = require("path");
var detective = require('detective');
var q = require('q');
var walkdir = require("walkdir");
var _ = require('lodash');
var minimatch = require('minimatch');

function getModulesRequiredFromFilename(filename) {
  var content = fs.readFileSync(filename, "utf-8");
  return detective(content, {
    word: '',
    isRequire: function(node) {
      var callee = node.callee;
      return callee &&
        (
          (node.type === 'CallExpression' && callee.type === 'Identifier'
          && callee.name === 'require')
          ||
          (callee.property && callee.property.name === 'loadNpmTasks')
        );
    }
  });
}

function checkDirectory(dir, ignoreDirs, deps, devDeps) {

  var deferred = q.defer();
  var directoryPromises = [];
  var finder = walkdir(dir, { "no_recurse": true });

  finder.on("directory", function (subdir) {
    if (ignoreDirs.contains(path.basename(subdir))
      || (deps.isEmpty() && devDeps.isEmpty()))  {
        return;
    }

    directoryPromises.push(checkDirectory(subdir, ignoreDirs, deps, devDeps));
  });

  finder.on("file", function (filename) {
    if (path.extname(filename) === ".js") {
      var modulesRequired = getModulesRequiredFromFilename(filename);
      deps = deps.difference(modulesRequired);
      devDeps = devDeps.difference(modulesRequired);
    }
  });

  finder.on("end", function () {
    deferred.resolve(q.allSettled(directoryPromises).then(function(directoryResults) {

      _(directoryResults).each(function(result) {
        if (result.state === 'fulfilled') {
          deps = deps.intersection(result.value.dependencies);
          devDeps = devDeps.intersection(result.value.devDependencies);
        }
      });

      return {
        dependencies: deps.valueOf(),
        devDependencies: devDeps.valueOf()};
    }));
  });

  return deferred.promise;
}

function depCheck(rootDir, options, cb) {

  var pkg = require(path.join(rootDir, 'package.json'));
  var deps = filterDependencies(pkg.dependencies);
  var devDeps = filterDependencies(options.withoutDev ? [] : pkg.devDependencies);
  var ignoreDirs = _([
      '.git',
      '.svn',
      '.hg',
      '.idea',
      'node_modules'
    ])
    .concat(options.ignoreDirs)
    .flatten()
    .unique();

  function isIgnored(dependency) {
    return _.any(options.ignoreMatches, function(match) {
      return minimatch(dependency, match);
    });
  }

  function hasBin(dependency) {
    try {
      var depPkg = require(path.join(rootDir, "node_modules", dependency, "package.json"));
      return _.has(depPkg, 'bin');
    } catch (e) {}
  }

  function filterDependencies(dependencies) {
    return _(dependencies)
      .keys()
      .reject(hasBin)
      .reject(isIgnored)
  }

  return checkDirectory(rootDir, ignoreDirs, deps, devDeps)
    .then(cb)
    .done();
}

module.exports = depCheck;