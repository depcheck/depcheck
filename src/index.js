import fs from "fs";
import path from "path";
import Walker from 'node-source-walk';
import q from 'q';
import walkdir from "walkdir";
import _ from 'lodash';
import minimatch from 'minimatch';
import util from 'util';

function getArgumentFromCall(node) {
  return node.type === 'CallExpression' && node.arguments[0]
    ? node.arguments[0].value
    : undefined;
}

function isRequireFunction(node) {
  var callee = node.callee;
  return callee && callee.type === 'Identifier' && callee.name === 'require' &&
    getArgumentFromCall(node);
}

function isGruntLoadTaskCall(node) {
  var callee = node.callee;
  return callee && callee.property && callee.property.name === 'loadNpmTasks' &&
    getArgumentFromCall(node);
}

function isImportDeclaration(node) {
  return node.type === 'ImportDeclaration' && node.source && node.source.value;
}

function getModulesRequiredFromFilename(filename) {
  var content = fs.readFileSync(filename, "utf-8");
  if (!content) {
    return [];
  }

  var walker = new Walker();
  var dependencies = [];

  try {
    walker.walk(content, node => {
      if (isRequireFunction(node) || isGruntLoadTaskCall(node)) {
        dependencies.push(getArgumentFromCall(node));
      } else if (isImportDeclaration(node)) {
        dependencies.push(node.source.value);
      }
    });

    return dependencies;
  } catch (err) {
    return err;
  }
}

function checkDirectory(dir, ignoreDirs, deps, devDeps) {
  var deferred = q.defer();
  var directoryPromises = [];
  var finder = walkdir(dir, { "no_recurse": true });
  var invalidFiles = {};
  var invalidDirs = {};

  if (_.isEmpty(deps) && _.isEmpty(devDeps)) {
    finder.emit('end');
  }

  finder.on("directory", subdir => {
    if (_.contains(ignoreDirs, path.basename(subdir)))  {
      return;
    }

    directoryPromises.push(checkDirectory(subdir, ignoreDirs, deps, devDeps));
  });

  finder.on("file", filename => {
    if (path.extname(filename) === ".js") {
      var modulesRequired = getModulesRequiredFromFilename(filename);
      if (util.isError(modulesRequired)) {
        invalidFiles[filename] = modulesRequired;
      } else {
        modulesRequired = modulesRequired.map(module => {
          return module.replace ? module.replace(/\/.*$/, '') : module;
        });
        deps = _.difference(deps, modulesRequired);
        devDeps = _.difference(devDeps, modulesRequired);
      }
    }
  });

  finder.on("end", () => {
    deferred.resolve(q.allSettled(directoryPromises).then(directoryResults => {

      _.each(directoryResults, result => {
        if (result.state === 'fulfilled') {
          invalidFiles = _.merge(invalidFiles, result.value.invalidFiles, {});
          deps = _.intersection(deps, result.value.dependencies);
          devDeps = _.intersection(devDeps, result.value.devDependencies);
        } else {
          var dirPath = result.reason.dirPath;
          var error = result.reason.error;
          invalidDirs[dirPath] = error;
        }
      });

      return {
        dependencies: deps,
        devDependencies: devDeps,
        invalidFiles: invalidFiles,
        invalidDirs: invalidDirs,
      };
    }));
  });

  finder.on("error", (dirPath, err) => {
    deferred.reject({
      dirPath: dirPath,
      error: err,
    });
  });

  return deferred.promise;
}

function depCheck(rootDir, options, cb) {

  var pkg = options.package || require(path.join(rootDir, 'package.json'));
  var deps = filterDependencies(pkg.dependencies);
  var devDeps = filterDependencies(options.withoutDev ? [] : pkg.devDependencies);

  var ignoreDirs =
    _([
      '.git',
      '.svn',
      '.hg',
      '.idea',
      'node_modules',
      'bower_components',
    ])
    .concat(options.ignoreDirs)
    .flatten()
    .unique()
    .valueOf();

  function isIgnored(dependency) {
    return _.any(options.ignoreMatches, match => {
      return minimatch(dependency, match);
    });
  }

  function hasBin(dependency) {
    try {
      var depPkg = require(path.join(rootDir, "node_modules", dependency, "package.json"));
      return _.has(depPkg, 'bin');
    } catch (e) {
      return false;
    }
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
