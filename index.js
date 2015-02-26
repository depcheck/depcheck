var fs = require("fs");
var path = require("path");
var detective = require('detective');
var q = require('q');
var walkdir = require("walkdir");
var _ = require('lodash');
var minimatch = require('minimatch');
var util = require('util');

function getModulesRequiredFromFilename(filename) {
  var content = fs.readFileSync(filename, "utf-8");
  try {
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
  } catch (err) {
    return err;
  }
}

function checkDirectory(dir, ignoreDirs, deps, devDeps) {

  var deferred = q.defer();
  var directoryPromises = [];
  var finder = walkdir(dir, { "no_recurse": true });
  var invalidFiles = {};

  finder.on("directory", function (subdir) {
    if (_.contains(ignoreDirs, path.basename(subdir))
      || (_.isEmpty(deps) && _.isEmpty(devDeps)))  {
        return;
    }

    directoryPromises.push(checkDirectory(subdir, ignoreDirs, deps, devDeps));
  });

  finder.on("file", function (filename) {
    if (path.extname(filename) === ".js") {
      var modulesRequired = getModulesRequiredFromFilename(filename);
      if (util.isError(modulesRequired)) {
        invalidFiles[filename] = modulesRequired;
      } else {
        modulesRequired = modulesRequired.map(function (module) {
          return module.replace ? module.replace(/\/.*$/, '') : module;
        });
        deps = _.difference(deps, modulesRequired);
        devDeps = _.difference(devDeps, modulesRequired);
      }
    }
  });

  finder.on("end", function () {
    deferred.resolve(q.allSettled(directoryPromises).then(function(directoryResults) {

      _.each(directoryResults, function(result) {
        if (result.state === 'fulfilled') {
          invalidFiles = _.merge(invalidFiles, result.value.invalidFiles, {});
          deps = _.intersection(deps, result.value.dependencies);
          devDeps = _.intersection(devDeps, result.value.devDependencies);
        }
      });

      return {
        dependencies: deps,
        devDependencies: devDeps,
        invalidFiles: invalidFiles
      };
    }));
  });

  return deferred.promise;
}

function depCheck(rootDir, options, cb) {

  var pkg = options.package || require(path.join(rootDir, 'package.json'));
  var deps = filterDependencies(pkg.dependencies);
  var devDeps = filterDependencies(options.withoutDev ? [] : pkg.devDependencies);
  var ignoreDirs = _([
      '.git',
      '.svn',
      '.hg',
      '.idea',
      'node_modules',
      'bower_components'
    ])
    .concat(options.ignoreDirs)
    .flatten()
    .unique()
    .valueOf();

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
      .valueOf();
  }

  return checkDirectory(rootDir, ignoreDirs, deps, devDeps)
    .then(cb)
    .done();
}

module.exports = depCheck;
