'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = check;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _walkdir = require('walkdir');

var _walkdir2 = _interopRequireDefault(_walkdir);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _builtinModules = require('builtin-modules');

var _builtinModules2 = _interopRequireDefault(_builtinModules);

var _requirePackageName = require('require-package-name');

var _requirePackageName2 = _interopRequireDefault(_requirePackageName);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function isModule(dir) {
  try {
    (0, _utils.readJSON)(_path2.default.resolve(dir, 'package.json'));
    return true;
  } catch (error) {
    return false;
  }
}

function mergeBuckets(object1, object2) {
  return _lodash2.default.mergeWith(object1, object2, function (value1, value2) {
    var array1 = value1 || [];
    var array2 = value2 || [];
    return array1.concat(array2);
  });
}

function detect(detectors, node) {
  return (0, _lodash2.default)(detectors).map(function (detector) {
    try {
      return detector(node);
    } catch (error) {
      return [];
    }
  }).flatten().value();
}

// fix for node.js <= 3, it throws TypeError when value type invalid in weak set
function hasVisited(ast, visited) {
  try {
    return visited.has(ast);
  } catch (e) {
    return false;
  }
}

function recursive(ast, visited) {
  if (!ast || hasVisited(ast, visited)) {
    return [];
  } else if (_lodash2.default.isArray(ast)) {
    return (0, _lodash2.default)(ast).map(function (node) {
      return recursive(node, visited);
    }).flatten().value();
  } else if (ast.type) {
    visited.add(ast);
    return (0, _lodash2.default)(ast).keys().filter(function (key) {
      return key !== 'tokens' && key !== 'comments';
    }).map(function (key) {
      return recursive(ast[key], visited);
    }).flatten().concat(ast).value();
  }

  return [];
}

function getNodes(ast) {
  var visited = new WeakSet();
  var nodes = recursive(ast, visited);
  return nodes;
}

function discoverPropertyDep(rootDir, deps, property, depName) {
  try {
    var file = _path2.default.resolve(rootDir, 'node_modules', depName, 'package.json');
    var metadata = (0, _utils.readJSON)(file);
    var propertyDeps = Object.keys(metadata[property] || {});
    return _lodash2.default.intersection(deps, propertyDeps);
  } catch (error) {
    return [];
  }
}

function getDependencies(dir, filename, deps, parser, detectors) {
  return new Promise(function (resolve, reject) {
    _fs2.default.readFile(filename, 'utf8', function (error, content) {
      if (error) {
        reject(error);
      }

      try {
        resolve(parser(content, filename, deps, dir));
      } catch (syntaxError) {
        reject(syntaxError);
      }
    });
  }).then(function (ast) {
    // when parser returns string array, skip detector step and treat them as dependencies.
    var dependencies = _lodash2.default.isArray(ast) && ast.every(_lodash2.default.isString) ? ast : (0, _lodash2.default)(getNodes(ast)).map(function (node) {
      return detect(detectors, node);
    }).flatten().uniq().map(_requirePackageName2.default).value();

    var discover = _lodash2.default.partial(discoverPropertyDep, dir, deps);
    var discoverPeerDeps = _lodash2.default.partial(discover, 'peerDependencies');
    var discoverOptionalDeps = _lodash2.default.partial(discover, 'optionalDependencies');
    var peerDeps = (0, _lodash2.default)(dependencies).map(discoverPeerDeps).flatten().value();
    var optionalDeps = (0, _lodash2.default)(dependencies).map(discoverOptionalDeps).flatten().value();

    return dependencies.concat(peerDeps).concat(optionalDeps);
  });
}

function checkFile(dir, filename, deps, parsers, detectors) {
  var basename = _path2.default.basename(filename);
  var targets = (0, _lodash2.default)(parsers).keys().filter(function (glob) {
    return (0, _minimatch2.default)(basename, glob, { dot: true });
  }).map(function (key) {
    return parsers[key];
  }).flatten().value();

  return targets.map(function (parser) {
    return getDependencies(dir, filename, deps, parser, detectors).then(function (using) {
      return {
        using: _defineProperty({}, filename, (0, _lodash2.default)(using).filter(function (dep) {
          return dep && dep !== '.' && dep !== '..';
        }) // TODO why need check?
        .filter(function (dep) {
          return !_lodash2.default.includes(_builtinModules2.default, dep);
        }).uniq().value())
      };
    }, function (error) {
      return {
        invalidFiles: _defineProperty({}, filename, error)
      };
    });
  });
}

function checkDirectory(dir, rootDir, ignoreDirs, deps, parsers, detectors) {
  return new Promise(function (resolve) {
    var promises = [];
    var finder = (0, _walkdir2.default)(dir, { no_recurse: true });

    finder.on('directory', function (subdir) {
      return ignoreDirs.indexOf(_path2.default.basename(subdir)) === -1 && !isModule(subdir) ? promises.push(checkDirectory(subdir, rootDir, ignoreDirs, deps, parsers, detectors)) : null;
    });

    finder.on('file', function (filename) {
      return promises.push.apply(promises, _toConsumableArray(checkFile(rootDir, filename, deps, parsers, detectors)));
    });

    finder.on('error', function (dirPath, error) {
      return promises.push(Promise.resolve({
        invalidDirs: _defineProperty({}, dirPath, error)
      }));
    });

    finder.on('end', function () {
      return resolve(Promise.all(promises).then(function (results) {
        return results.reduce(function (obj, current) {
          return {
            using: mergeBuckets(obj.using, current.using || {}),
            invalidFiles: _extends(obj.invalidFiles, current.invalidFiles),
            invalidDirs: _extends(obj.invalidDirs, current.invalidDirs)
          };
        }, {
          using: {},
          invalidFiles: {},
          invalidDirs: {}
        });
      }));
    });
  });
}

function buildResult(result, deps, devDeps, peerDeps, optionalDeps) {
  var usingDepsLookup = (0, _lodash2.default)(result.using)
  // { f1:[d1,d2,d3], f2:[d2,d3,d4] }
  .toPairs()
  // [ [f1,[d1,d2,d3]], [f2,[d2,d3,d4]] ]
  .map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        file = _ref2[0],
        dep = _ref2[1];

    return [dep, _lodash2.default.times(dep.length, function () {
      return file;
    })];
  })
  // [ [ [d1,d2,d3],[f1,f1,f1] ], [ [d2,d3,d4],[f2,f2,f2] ] ]
  .map(function (pairs) {
    return _lodash2.default.zip.apply(_lodash2.default, _toConsumableArray(pairs));
  })
  // [ [ [d1,f1],[d2,f1],[d3,f1] ], [ [d2,f2],[d3,f2],[d4,f2]] ]
  .flatten()
  // [ [d1,f1], [d2,f1], [d3,f1], [d2,f2], [d3,f2], [d4,f2] ]
  .groupBy(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 1),
        dep = _ref4[0];

    return dep;
  })
  // { d1:[ [d1,f1] ], d2:[ [d2,f1],[d2,f2] ], d3:[ [d3,f1],[d3,f2] ], d4:[ [d4,f2] ] }
  .mapValues(function (pairs) {
    return pairs.map(_lodash2.default.last);
  })
  // { d1:[ f1 ], d2:[ f1,f2 ], d3:[ f1,f2 ], d4:[ f2 ] }
  .value();

  var usingDeps = Object.keys(usingDepsLookup);
  var allDeps = deps.concat(devDeps).concat(peerDeps).concat(optionalDeps);
  var missingDeps = _lodash2.default.difference(usingDeps, allDeps);

  var missingDepsLookup = (0, _lodash2.default)(missingDeps).map(function (missingDep) {
    return [missingDep, usingDepsLookup[missingDep]];
  }).fromPairs().value();

  return {
    dependencies: _lodash2.default.difference(deps, usingDeps),
    devDependencies: _lodash2.default.difference(devDeps, usingDeps),
    missing: missingDepsLookup,
    using: usingDepsLookup,
    invalidFiles: result.invalidFiles,
    invalidDirs: result.invalidDirs
  };
}

function check(_ref5) {
  var rootDir = _ref5.rootDir,
      ignoreDirs = _ref5.ignoreDirs,
      deps = _ref5.deps,
      devDeps = _ref5.devDeps,
      peerDeps = _ref5.peerDeps,
      optionalDeps = _ref5.optionalDeps,
      parsers = _ref5.parsers,
      detectors = _ref5.detectors;

  var allDeps = _lodash2.default.union(deps, devDeps);
  return checkDirectory(rootDir, rootDir, ignoreDirs, allDeps, parsers, detectors).then(function (result) {
    return buildResult(result, deps, devDeps, peerDeps, optionalDeps);
  });
}
module.exports = exports['default'];