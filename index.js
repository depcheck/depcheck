var fs = require("fs");
var path = require("path");
var esprima = require("esprima");
var sets = require("simplesets");
var q = require('q');

var walkdir = require("walkdir");
var _ = require('lodash');
var traverse = require('traverse');


if (typeof String.prototype.startsWith !== "function") {
  String.prototype.startsWith = function (str) {
    return this.slice(0, str.length) === str;
  };
}

/*
function traverse(object, visitor) {
  var key, child;

  if (visitor.call(null, object) === false) {
    return;
  }

  for (key in object) {
    if (object.hasOwnProperty(key)) {
      child = object[key];
      if (typeof child === "object" && child !== null) {
        traverse(child, visitor);
      }
    }
  }
}
*/

function isRequire(node) {
  return node.callee.name === "require" || (node.callee.property && node.callee.property.name === "loadNpmTasks");
}

function parse(filename) {
  var content = fs.readFileSync(filename, "utf-8");
  var lines;
  try {
    lines = content.split("\n");
    if (lines[0][0] === "#") {
      lines.shift();
      content = lines.join("\n");
    }

    return esprima.parse(content, {tolerant: true});
  } catch (e) {
    return null;
  }
}

function checkFile(filename) {
  var syntax = parse(filename);

  if (!syntax) {
    return;
  }

  var used = [];
  traverse(syntax).forEach(function (node) {
    var arg;

    if (!node) {return;}

    if (node.type !== "CallExpression") {
      return;
    }
    if (node.arguments.length !== 1) {
      return;
    }
    if (!isRequire(node)) {
      return;
    }

    arg = node.arguments[0];

    if (arg.type === "Literal" && arg.value[0] !== ".") {
      used.push(arg.value);
    }
  });

  return used;
}



function collectUnused(root, usedDependencies, definedDependencies) {
  var found = new sets.Set();

  definedDependencies.array().forEach(function (definedDependency) {
    usedDependencies.array().forEach(function (usedDependency) {
      if (usedDependency === definedDependency || usedDependency.startsWith(definedDependency + "/") || hasBin(root, definedDependency)) {
        found.add(definedDependency);
      }
    });
  });

  return definedDependencies.difference(found).array();
}

function check(files, options) {
  var usedDependencies = new sets.Set();

  var ret = {};

  files.forEach(function (file) {
    usedDependencies = usedDependencies.union(checkFile(file));
  });

  ret.dependencies = collectUnused(root, usedDependencies, deps);

  if (!options.withoutDev) {
    ret.devDependencies = collectUnused(root, usedDependencies, devDeps);
  } else {
    ret.devDependencies = [];
  }

  return ret;
}

function checkDirectory(dir, ignorePaths, deps, devDeps) {

  var deferred = q.defer();

  var directoryPromises = [];

  var finder = walkdir(dir, { "no_recurse": true });

  finder.on("directory", function (subdir) {
    if (ignorePaths.contains(path.basename(subdir))
      || (deps.isEmpty() && devDeps.isEmpty()))  {
        return;
    }

    directoryPromises.push(checkDirectory(subdir, ignorePaths, deps, devDeps));
  });

  finder.on("file", function (file) {
    if (path.extname(file) === ".js") {
      deps = deps.difference(checkFile(file));
      devDeps = devDeps.difference(checkFile(file));
    }
  });

  finder.on("end", function () {
    deferred.resolve(q.allSettled(directoryPromises).then(function(directoryResults) {

      _(directoryResults).each(function(result) {
        if (result.state = 'fulfilled') {
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
  var ignorePaths = _([
    '.git',
    '.svn',
    '.hg',
    '.idea',
    'node_modules'
  ])
    .concat(options.ignorePaths)
    .flatten()
    .unique();

  function hasBin(dependency) {
    try {
      var depPkg = require(path.join(rootDir, "node_modules", dependency, "package.json"));
      return _.has(depPkg, 'bin');
    } catch (e) {}
  }

  function filterDependencies(dependencies) {
    return _(dependencies)
      .keys()
      .reject(hasBin);
  }

  return checkDirectory(rootDir, ignorePaths, deps, devDeps)
    .then(cb).done();
}

module.exports = depCheck;